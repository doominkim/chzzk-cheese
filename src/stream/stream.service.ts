import { Injectable } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { ChzzkService } from '../chzzk/chzzk.service';
import { MinioService } from '../minio/minio.service';
import { LoggerService } from 'src/logger/logger.service';
import { LogLevel, LogSource } from 'src/logger/logger.entity';
import { ChannelService } from 'src/channel/services/channel.service';

interface ChannelProcesses {
  streamlink: ChildProcess | null;
  audio: ChildProcess | null;
  capture: ChildProcess | null;
}

export class StreamError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StreamError';
  }
}

@Injectable()
export class StreamService {
  private readonly outputDir = 'recordings';
  private readonly maxFileAge = 24 * 60 * 60 * 1000; // 24시간
  private readonly maxDirSize = 10 * 1024 * 1024 * 1024; // 10GB
  private readonly channelProcesses: Map<string, ChannelProcesses> = new Map();

  private readonly ERROR_MESSAGES = {
    CHANNEL_NOT_FOUND: '채널을 찾을 수 없습니다.',
    CHANNEL_NOT_LIVE: '채널이 방송을 시작하지 않았습니다.',
    NO_COLLECTION_ENABLED: '오디오 또는 캡처 수집이 활성화되어 있지 않습니다.',
    HLS_NOT_FOUND: 'HLS 스트림을 찾을 수 없습니다.',
    FILE_NOT_FOUND: '파일을 찾을 수 없습니다.',
    FILE_DELETE_ERROR: '파일 삭제 중 오류가 발생했습니다.',
    UPLOAD_ERROR: '파일 업로드 중 오류가 발생했습니다.',
    PROCESS_ALREADY_RUNNING: '이미 실행 중인 프로세스가 있습니다.',
  };

  private readonly ERROR_CODES = {
    CHANNEL_NOT_FOUND: 'CHANNEL_NOT_FOUND',
    CHANNEL_NOT_LIVE: 'CHANNEL_NOT_LIVE',
    NO_COLLECTION_ENABLED: 'NO_COLLECTION_ENABLED',
    HLS_NOT_FOUND: 'HLS_NOT_FOUND',
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    FILE_DELETE_ERROR: 'FILE_DELETE_ERROR',
    UPLOAD_ERROR: 'UPLOAD_ERROR',
    PROCESS_ALREADY_RUNNING: 'PROCESS_ALREADY_RUNNING',
  };

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

  private getChannelProcesses(channelId: string): ChannelProcesses {
    if (!this.channelProcesses.has(channelId)) {
      this.channelProcesses.set(channelId, {
        streamlink: null,
        audio: null,
        capture: null,
      });
    }
    return this.channelProcesses.get(channelId)!;
  }

  private async startStreamlink(
    channelId: string,
    streamUrl: string,
  ): Promise<void> {
    const processes = this.getChannelProcesses(channelId);

    if (processes.streamlink && !processes.streamlink.killed) {
      throw new StreamError(
        this.ERROR_MESSAGES.PROCESS_ALREADY_RUNNING,
        this.ERROR_CODES.PROCESS_ALREADY_RUNNING,
      );
    }

    processes.streamlink = spawn('streamlink', [
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

    processes.streamlink.on('exit', () => {
      this.logger.info(
        LogSource.STREAM,
        `Streamlink process for channel ${channelId} exited`,
      );
      processes.streamlink = null;
    });

    processes.streamlink.stderr.on('data', (data: Buffer) => {
      this.logger.info(
        LogSource.STREAM,
        `Streamlink info for channel ${channelId}: ${data}`,
      );
    });
  }

  private async startAudioCapture(
    channelId: string,
    channelDir: string,
  ): Promise<void> {
    const processes = this.getChannelProcesses(channelId);

    if (!processes.streamlink) {
      throw new StreamError(
        'Streamlink process not running',
        'STREAMLINK_NOT_RUNNING',
      );
    }

    processes.audio = spawn('ffmpeg', [
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
      join(channelDir, `audio_${this.formatDate(new Date())}_%03d.aac`),
    ]);

    processes.streamlink.stdout.pipe(processes.audio.stdin);

    processes.audio.on('exit', () => {
      this.logger.info(
        LogSource.STREAM,
        `Audio process for channel ${channelId} exited`,
      );
      processes.audio = null;
    });

    processes.audio.stderr.on('data', (data: Buffer) => {
      this.logger.info(
        LogSource.STREAM,
        `Audio ffmpeg info for channel ${channelId}: ${data}`,
      );
    });
  }

  private async startImageCapture(
    channelId: string,
    channelDir: string,
  ): Promise<void> {
    const processes = this.getChannelProcesses(channelId);

    if (!processes.streamlink) {
      throw new StreamError(
        'Streamlink process not running',
        'STREAMLINK_NOT_RUNNING',
      );
    }

    processes.capture = spawn('ffmpeg', [
      '-i',
      '-',
      '-f',
      'image2',
      '-vf',
      'fps=0.1',
      '-timestamp',
      'now',
      join(channelDir, `capture_${new Date()}_%03d.jpg`),
    ]);

    processes.streamlink.stdout.pipe(processes.capture.stdin);

    processes.capture.on('exit', () => {
      this.logger.info(
        LogSource.STREAM,
        `Capture process for channel ${channelId} exited`,
      );
      processes.capture = null;
    });

    processes.capture.stderr.on('data', (data: Buffer) => {
      this.logger.info(
        LogSource.STREAM,
        `Capture ffmpeg info for channel ${channelId}: ${data}`,
      );
    });
  }

  async startRecording(channelId: string): Promise<string> {
    try {
      // 프로세스 실행 여부 확인
      const processes = this.getChannelProcesses(channelId);
      if (processes.streamlink && !processes.streamlink.killed) {
        return '이미 실행중인 프로세스입니다';
      }

      // 채널 설정 확인
      const channel = await this.channelService.findChannelByUUID(channelId);
      if (!channel) {
        throw new StreamError(
          this.ERROR_MESSAGES.CHANNEL_NOT_FOUND,
          this.ERROR_CODES.CHANNEL_NOT_FOUND,
        );
      }

      if (!channel.openLive) {
        await this.stopRecording(channelId);

        throw new StreamError(
          this.ERROR_MESSAGES.CHANNEL_NOT_LIVE,
          this.ERROR_CODES.CHANNEL_NOT_LIVE,
        );
      }

      if (!channel.isAudioCollected && !channel.isCaptureCollected) {
        throw new StreamError(
          this.ERROR_MESSAGES.NO_COLLECTION_ENABLED,
          this.ERROR_CODES.NO_COLLECTION_ENABLED,
        );
      }

      const live = await this.chzzkService.getChannelLiveDetail(channelId);
      const liveId = live.liveId.toString();
      const media = live.livePlayback.media;
      const hls = media.find((media) => media.mediaId === 'HLS');

      if (!hls) {
        throw new StreamError(
          this.ERROR_MESSAGES.HLS_NOT_FOUND,
          this.ERROR_CODES.HLS_NOT_FOUND,
        );
      }

      const streamUrl = hls.path;
      const channelDir = join(this.outputDir, channelId, liveId);

      if (!existsSync(channelDir)) {
        mkdirSync(channelDir, { recursive: true });
      }

      // Streamlink 프로세스 시작
      await this.startStreamlink(channelId, streamUrl);

      // 오디오 수집이 활성화된 경우
      if (channel.isAudioCollected) {
        await this.startAudioCapture(channelId, channelDir);
      }

      // 캡처 수집이 활성화된 경우
      if (channel.isCaptureCollected) {
        await this.startImageCapture(channelId, channelDir);
      }

      // 파일 생성 이벤트 감지
      const checkAndUploadFiles = async () => {
        try {
          await this.checkAndUploadFiles(channelId, liveId, channelDir);
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

  async stopRecording(channelId: string): Promise<void> {
    const processes = this.getChannelProcesses(channelId);

    if (!processes) {
      return;
    }

    if (processes.capture) {
      processes.capture.kill();
      processes.capture = null;
    }

    if (processes.audio) {
      processes.audio.kill();
      processes.audio = null;
    }

    if (processes.streamlink) {
      processes.streamlink.kill();
      processes.streamlink = null;
    }

    this.channelProcesses.delete(channelId);
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

  private async checkAndUploadFiles(
    channelId: string,
    liveId: string,
    channelDir: string,
  ) {
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
            await this.minioService.uploadStreamFiles(
              channelId,
              liveId,
              channelDir,
              {
                audioFiles: [file],
                imageFiles: [],
              },
            );

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
            await this.minioService.uploadStreamFiles(
              channelId,
              liveId,
              channelDir,
              {
                audioFiles: [],
                imageFiles: [file],
              },
            );

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

  // 날짜 포맷팅 유틸리티 함수
  private formatDate(date: Date): string {
    return date.toISOString().replace(/[:.]/g, '-');
  }
}
