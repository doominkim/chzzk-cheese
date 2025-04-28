import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { ChzzkService } from '../chzzk/chzzk.service';
import { MinioService } from '../minio/minio.service';
import { LoggerService } from 'src/logger/logger.service';
import { LogLevel, LogSource } from 'src/logger/logger.entity';
import { ChannelService } from 'src/channel/services/channel.service';

@Injectable()
export class StreamService {
  private readonly outputDir = 'recordings';
  private readonly maxFileAge = 24 * 60 * 60 * 1000; // 24시간
  private readonly maxDirSize = 10 * 1024 * 1024 * 1024; // 10GB
  private streamlinkProcess: any;
  private videoProcess: any;
  private audioProcess: any;
  private captureProcess: any;

  constructor(
    private readonly chzzkService: ChzzkService,
    private readonly minioService: MinioService,
    private readonly logger: LoggerService,
    private readonly channelService: ChannelService,
  ) {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
    // 주기적으로 임시 파일 정리
    setInterval(() => this.cleanupTempFiles(), 60 * 60 * 1000); // 1시간마다
  }

  private cleanupTempFiles() {
    try {
      const now = Date.now();
      const files = readdirSync(this.outputDir);
      let totalSize = 0;

      for (const file of files) {
        const filePath = join(this.outputDir, file);
        const stats = statSync(filePath);
        totalSize += stats.size;

        // 파일이 24시간 이상 지났거나 디렉토리 크기가 10GB를 초과하면 삭제
        if (
          now - stats.mtimeMs > this.maxFileAge ||
          totalSize > this.maxDirSize
        ) {
          try {
            unlinkSync(filePath);
            this.logger.log(
              LogLevel.INFO,
              LogSource.STREAM,
              `Cleaned up temporary file: ${file}`,
            );
          } catch (error) {
            this.logger.error(
              LogSource.STREAM,
              `Error cleaning up file ${file}: ${error.message}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        LogSource.STREAM,
        `Error in cleanupTempFiles: ${error.message}`,
      );
    }
  }

  private isFileComplete(filePath: string): boolean {
    try {
      const stats = statSync(filePath);
      const now = Date.now();

      // 파일 크기가 0보다 크고
      // 10초 이상 크기가 변하지 않았고 (더 긴 시간으로 설정)
      // 10초 이상 수정되지 않았다면 완성된 것으로 간주
      return stats.size > 0 && now - stats.ctimeMs > 10000;
    } catch (error) {
      return false;
    }
  }

  private async checkAndUploadFiles(channelId: string, channelDir: string) {
    try {
      const files = readdirSync(channelDir);
      const audioFiles = files.filter((file) => file.endsWith('.aac'));
      const imageFiles = files.filter((file) => file.endsWith('.jpg'));

      // 완성된 파일만 필터링
      const completedAudioFiles = audioFiles.filter((file) =>
        this.isFileComplete(join(channelDir, file)),
      );
      const completedImageFiles = imageFiles.filter((file) =>
        this.isFileComplete(join(channelDir, file)),
      );

      // 오디오 파일 순차 처리
      for (const file of completedAudioFiles) {
        try {
          const { audioFiles: uploadedAudioFiles } =
            await this.minioService.uploadStreamFiles(channelId, channelDir, {
              audioFiles: [file],
              imageFiles: [],
            });

          if (uploadedAudioFiles.length > 0) {
            const filePath = join(channelDir, file);
            if (existsSync(filePath)) {
              unlinkSync(filePath);
              this.logger.log(
                LogLevel.INFO,
                LogSource.STREAM,
                `Deleted uploaded audio file: ${file}`,
              );
            }
          }
        } catch (error) {
          this.logger.error(
            LogSource.STREAM,
            `Error processing audio file ${file}: ${error.message}`,
          );
        }
      }

      // 이미지 파일 순차 처리
      for (const file of completedImageFiles) {
        try {
          const { imageFiles: uploadedImageFiles } =
            await this.minioService.uploadStreamFiles(channelId, channelDir, {
              audioFiles: [],
              imageFiles: [file],
            });

          if (uploadedImageFiles.length > 0) {
            const filePath = join(channelDir, file);
            if (existsSync(filePath)) {
              unlinkSync(filePath);
              this.logger.log(
                LogLevel.INFO,
                LogSource.STREAM,
                `Deleted uploaded image file: ${file}`,
              );
            }
          }
        } catch (error) {
          this.logger.error(
            LogSource.STREAM,
            `Error processing image file ${file}: ${error.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        LogSource.STREAM,
        `Error in checkAndUploadFiles: ${error.message}`,
      );
    }
  }

  async startRecording(channelId: string): Promise<string> {
    try {
      // 채널 설정 확인
      const channel = await this.channelService.findChannelByUUID(channelId);
      if (!channel) {
        throw new Error('채널을 찾을 수 없습니다.');
      }

      if (!channel.openLive) {
        throw new Error('채널이 방송을 시작하지 않았습니다.');
      }

      if (!channel.isAudioCollected && !channel.isCaptureCollected) {
        throw new Error('오디오 또는 캡처 수집이 활성화되어 있지 않습니다.');
      }

      const live = await this.chzzkService.getChannelLiveDetail(channelId);
      const media = live.livePlayback.media;
      const hls = media.find((media) => media.mediaId === 'HLS');

      if (!hls) {
        throw new Error('HLS 스트림을 찾을 수 없습니다.');
      }

      const streamUrl = hls.path;
      const channelDir = join(this.outputDir, channelId);

      if (!existsSync(channelDir)) {
        mkdirSync(channelDir, { recursive: true });
      }

      // Streamlink 프로세스
      this.streamlinkProcess = spawn('streamlink', [
        '--http-header',
        'User-Agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        '--http-header',
        'Referer=https://chzzk.naver.com/',
        '--http-header',
        'Origin=https://chzzk.naver.com',
        '-O',
        streamUrl,
        'best',
      ]);

      const timestamp = Date.now();

      // 오디오 수집이 활성화된 경우
      if (channel.isAudioCollected) {
        this.audioProcess = spawn('ffmpeg', [
          '-i',
          '-',
          '-map',
          '0:a',
          '-c:a',
          'copy',
          '-f',
          'segment',
          '-segment_time',
          '10',
          '-reset_timestamps',
          '1',
          '-movflags',
          '+faststart',
          '-write_xing',
          '1',
          '-id3v2_version',
          '3',
          '-timestamp',
          'now',
          join(channelDir, `audio_${timestamp}_%03d.aac`),
        ]);
        this.streamlinkProcess.stdout.pipe(this.audioProcess.stdin);
      }

      // 캡처 수집이 활성화된 경우
      if (channel.isCaptureCollected) {
        this.captureProcess = spawn('ffmpeg', [
          '-i',
          '-',
          '-f',
          'image2',
          '-vf',
          'fps=0.1',
          '-timestamp',
          'now',
          join(channelDir, `capture_${timestamp}_%03d.jpg`),
        ]);
        this.streamlinkProcess.stdout.pipe(this.captureProcess.stdin);
      }

      this.streamlinkProcess.stderr.on('data', (data: Buffer) => {
        this.logger.info(LogSource.STREAM, `Streamlink info: ${data}`);
      });

      if (this.audioProcess) {
        this.audioProcess.stderr.on('data', (data: Buffer) => {
          this.logger.info(LogSource.STREAM, `Audio ffmpeg info: ${data}`);
        });
      }

      if (this.captureProcess) {
        this.captureProcess.stderr.on('data', (data: Buffer) => {
          this.logger.info(LogSource.STREAM, `Capture ffmpeg info: ${data}`);
        });
      }

      // 파일 생성 이벤트 감지
      const checkAndUploadFiles = async () => {
        try {
          await this.checkAndUploadFiles(channelId, channelDir);
        } catch (error) {
          this.logger.error(
            LogSource.STREAM,
            `Error in checkAndUploadFiles: ${error.message}`,
          );
        }
      };

      // 10초마다 파일 체크 및 업로드
      setInterval(checkAndUploadFiles, 10000);

      return 'Recording started';
    } catch (error) {
      this.logger.error(
        LogSource.STREAM,
        `Error starting recording: ${error.message}`,
      );
      throw error;
    }
  }

  async stopRecording(): Promise<void> {
    try {
      this.streamlinkProcess?.kill();
      this.videoProcess?.kill();
      this.audioProcess?.kill();
      this.captureProcess?.kill();
    } catch (error) {
      this.logger.error(
        LogSource.STREAM,
        `Error stopping recording: ${error.message}`,
      );
      throw error;
    }
  }
}
