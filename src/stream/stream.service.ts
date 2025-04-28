import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { ChzzkService } from '../chzzk/chzzk.service';
import { MinioService } from '../minio/minio.service';
import { LoggerService } from 'src/logger/logger.service';
import { LogLevel, LogSource } from 'src/logger/logger.entity';

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

  async startRecording(channelId: string): Promise<string> {
    try {
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

      // 비디오 세그먼트 프로세스
      const timestamp = Date.now();
      this.videoProcess = spawn('ffmpeg', [
        '-i',
        '-',
        '-map',
        '0:v',
        '-c:v',
        'copy',
        '-f',
        'segment',
        '-segment_time',
        '10',
        '-reset_timestamps',
        '1',
        join(channelDir, `video_${timestamp}_%03d.mp4`),
      ]);

      // 오디오 세그먼트 프로세스
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
        join(channelDir, `audio_${timestamp}_%03d.aac`),
      ]);

      // 캡처 프로세스
      this.captureProcess = spawn('ffmpeg', [
        '-i',
        '-',
        '-vf',
        'fps=0.1',
        join(channelDir, `capture_${timestamp}_%03d.jpg`),
      ]);

      // 파이프 연결
      this.streamlinkProcess.stdout.pipe(this.videoProcess.stdin);
      this.streamlinkProcess.stdout.pipe(this.audioProcess.stdin);
      this.streamlinkProcess.stdout.pipe(this.captureProcess.stdin);

      // 에러 핸들링
      const isRealError = (data: Buffer) => {
        const msg = data.toString().toLowerCase();
        return (
          msg.includes('error') || msg.includes('fail') || msg.includes('fatal')
        );
      };

      this.streamlinkProcess.stderr.on('data', (data: Buffer) => {
        if (isRealError(data)) {
          this.logger.error(
            LogSource.STREAM,
            `Streamlink error: ${data}`,
            {},
            new Error(data.toString()),
          );
        }
      });

      this.videoProcess.stderr.on('data', (data: Buffer) => {
        if (isRealError(data)) {
          this.logger.error(
            LogSource.STREAM,
            `Video ffmpeg error: ${data}`,
            {},
            new Error(data.toString()),
          );
        }
      });

      this.audioProcess.stderr.on('data', (data: Buffer) => {
        if (isRealError(data)) {
          this.logger.error(
            LogSource.STREAM,
            `Audio ffmpeg error: ${data}`,
            {},
            new Error(data.toString()),
          );
        }
      });

      this.captureProcess.stderr.on('data', (data: Buffer) => {
        if (isRealError(data)) {
          this.logger.error(
            LogSource.STREAM,
            `Capture ffmpeg error: ${data}`,
            {},
            new Error(data.toString()),
          );
        }
      });

      // 파일 생성 이벤트 감지
      const checkAndUploadFiles = async () => {
        try {
          const files = readdirSync(channelDir);
          const audioFiles = files.filter((file) => file.endsWith('.aac'));
          const imageFiles = files.filter((file) => file.endsWith('.jpg'));
          const videoFiles = files.filter((file) => file.endsWith('.mp4'));

          if (
            audioFiles.length > 0 ||
            imageFiles.length > 0 ||
            videoFiles.length > 0
          ) {
            const {
              audioFiles: uploadedAudioFiles,
              imageFiles: uploadedImageFiles,
            } = await this.minioService.uploadStreamFiles(
              channelId,
              channelDir,
            );

            // 업로드된 파일 삭제
            [...uploadedAudioFiles, ...uploadedImageFiles].forEach((file) => {
              const filePath = join(channelDir, file);
              if (existsSync(filePath)) {
                unlinkSync(filePath);
                this.logger.log(
                  LogLevel.INFO,
                  LogSource.STREAM,
                  `Deleted uploaded file: ${file}`,
                );
              } else {
                this.logger.warn(
                  LogSource.STREAM,
                  `File not found for deletion: ${file}`,
                );
              }
            });

            this.logger.log(
              LogLevel.INFO,
              LogSource.STREAM,
              `Uploaded ${uploadedAudioFiles.length} audio files and ${uploadedImageFiles.length} image files to MinIO`,
            );
          }
        } catch (error) {
          this.logger.error(
            LogSource.STREAM,
            `Error in checkAndUploadFiles: ${error.message}`,
          );
        }
      };

      // 10초마다 파일 체크 및 업로드
      setInterval(checkAndUploadFiles, 10000);

      return channelDir;
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
