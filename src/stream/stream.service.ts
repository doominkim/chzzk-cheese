import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { ChzzkService } from '../chzzk/chzzk.service';
import { MinioService } from '../minio/minio.service';
import { LoggerService } from 'src/logger/logger.service';
import { LogLevel, LogSource } from 'src/logger/logger.entity';
import { ChannelService } from 'src/channel/services/channel.service';
import { FileService } from '../file-system/services/file.service';
import { FileType } from '../file-system/types';
import { StreamError } from './stream.error';
import { QueueService } from 'src/queue/queue.service';
import { FileRepository } from '../file-system/repositories/file.repository';
import { File } from '../file-system/entities/file.entity';

interface ChannelProcesses {
  streamlink: ChildProcess | null;
  audio: ChildProcess | null;
  capture: ChildProcess | null;
  interval?: NodeJS.Timeout;
}

@Injectable()
export class StreamService {
  private readonly outputDir = 'recordings';
  private readonly maxFileAge = 24 * 60 * 60 * 1000; // 24시간
  private readonly maxDirSize = 10 * 1024 * 1024 * 1024; // 10GB
  private readonly channelProcesses: Map<string, ChannelProcesses> = new Map();
  private readonly uploadedFiles: Set<string> = new Set();
  private readonly processingFiles: Set<string> = new Set(); // 처리 중인 파일 추적
  private readonly MAX_PROCESSES = 50; // 최대 프로세스 수 제한
  private readonly MAX_CONCURRENT_UPLOADS = 3; // 동시 업로드 수 제한
  private readonly UPLOAD_RETRY_COUNT = 3; // 업로드 재시도 횟수
  private lastErrorLog: number | null = null;

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
    private readonly fileService: FileService,
    private readonly queueService: QueueService,
    private readonly fileRepository: FileRepository,
  ) {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
    // 주기적으로 임시 파일 정리
    setInterval(() => this.cleanupTempFiles(), 60 * 60 * 1000); // 1시간마다
    // 주기적으로 업로드된 파일 목록 정리
    setInterval(() => this.cleanupUploadedFiles(), 60 * 60 * 1000); // 1시간마다
    // 주기적으로 프로세스 Map 정리
    setInterval(() => this.cleanupProcesses(), 30 * 60 * 1000); // 30분마다
  }

  private cleanupProcesses() {
    if (this.channelProcesses.size > this.MAX_PROCESSES) {
      const keysToDelete = Array.from(this.channelProcesses.keys()).slice(
        0,
        10,
      );
      keysToDelete.forEach((key) => {
        const processes = this.channelProcesses.get(key);
        if (
          processes &&
          !processes.streamlink &&
          !processes.audio &&
          !processes.capture
        ) {
          if (processes.interval) {
            clearInterval(processes.interval);
          }
          this.channelProcesses.delete(key);
        }
      });
      this.logger.log(
        LogLevel.INFO,
        LogSource.STREAM,
        'Cleaned up inactive channel processes',
      );
    }
  }

  private getChannelProcesses(channelId: string): ChannelProcesses {
    if (!this.channelProcesses.has(channelId)) {
      this.channelProcesses.set(channelId, {
        streamlink: null,
        audio: null,
        capture: null,
        interval: undefined,
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
      // this.logger.info(
      //   LogSource.STREAM,
      //   `Streamlink info for channel ${channelId}: ${data}`,
      // );
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
      '-movflags',
      '+faststart',
      '-write_xing',
      '1',
      '-id3v2_version',
      '3',
      '-timestamp',
      'now',
      join(channelDir, `audio_${Date.now()}_%03d.aac`),
    ]);

    processes.streamlink.stdout.pipe(processes.audio.stdin);

    processes.audio.on('exit', () => {
      // this.logger.info(
      //   LogSource.STREAM,
      //   `Audio process for channel ${channelId} exited`,
      // );
      processes.audio = null;
    });

    processes.audio.stderr.on('data', (data: Buffer) => {
      // this.logger.info(
      //   LogSource.STREAM,
      //   `Audio ffmpeg info for channel ${channelId}: ${data}`,
      // );
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
      'fps=1/30',
      '-timestamp',
      'now',
      join(channelDir, `capture_${Date.now()}_%03d.jpg`),
    ]);

    processes.streamlink.stdout.pipe(processes.capture.stdin);

    processes.capture.on('exit', () => {
      // this.logger.info(
      //   LogSource.STREAM,
      //   `Capture process for channel ${channelId} exited`,
      // );
      processes.capture = null;
    });

    processes.capture.stderr.on('data', (data: Buffer) => {
      // this.logger.info(
      //   LogSource.STREAM,
      //   `Capture ffmpeg info for channel ${channelId}: ${data}`,
      // );
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

      // 기존 interval이 있다면 제거
      if (processes.interval) {
        clearInterval(processes.interval);
      }

      // 10초마다 파일 체크 및 업로드 (interval ID 저장)
      processes.interval = setInterval(checkAndUploadFiles, 10000);

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

    // interval 정리
    if (processes.interval) {
      clearInterval(processes.interval);
      processes.interval = undefined;
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

  private cleanupUploadedFiles() {
    this.uploadedFiles.clear();
    this.processingFiles.clear(); // 처리 중인 파일 목록도 정리
    this.logger.log(
      LogLevel.INFO,
      LogSource.STREAM,
      'Cleared uploaded and processing files cache',
    );
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

      // 동시 업로드 수 제한 - 처리 중인 파일 수가 제한을 초과하면 대기
      if (this.processingFiles.size >= this.MAX_CONCURRENT_UPLOADS) {
        this.logger.log(
          LogLevel.INFO,
          LogSource.STREAM,
          `Max concurrent uploads reached (${this.processingFiles.size}/${this.MAX_CONCURRENT_UPLOADS}), skipping this cycle`,
        );
        return;
      }

      // 처리할 파일 수 제한
      const filesToProcess = completedAudioFiles.slice(
        0,
        this.MAX_CONCURRENT_UPLOADS - this.processingFiles.size,
      );

      // 오디오 파일 순차 처리
      for (const file of filesToProcess) {
        const filePath = join(channelDir, file);
        const objectName = `channels/${channelId}/lives/${liveId}/audios/${file}`;

        // 이미 처리 중인 파일인지 확인
        if (this.processingFiles.has(objectName)) {
          continue;
        }

        try {
          // 처리 시작 표시
          this.processingFiles.add(objectName);

          // DB에서 이미 처리된 파일인지 확인
          const existingFile = await this.fileRepository.findByObjectName(
            objectName,
          );
          if (existingFile) {
            // 이미 처리된 파일은 로컬에서 삭제
            if (existsSync(filePath)) {
              unlinkSync(filePath);
            }
            continue;
          }

          // 파일이 아직 처리 중인지 확인 (큐에 있는지)
          const isJobInQueue = await this.queueService.isJobInQueue(
            'audio-processing',
            objectName,
          );
          if (isJobInQueue) {
            continue;
          }

          // 재시도 로직이 포함된 업로드
          const { audioFiles: uploadedAudioFiles } = await this.uploadWithRetry(
            channelId,
            liveId,
            channelDir,
            {
              audioFiles: [file],
              imageFiles: [],
            },
          );

          if (uploadedAudioFiles.length === 0) {
            throw new Error('Failed to upload audio file after retries');
          }

          await this.saveFileToDB(channelId, liveId, filePath, FileType.AUDIO);
          await this.queueService.addJob('audio-processing', {
            filePath: objectName,
            channelId,
            liveId,
            startTime: '0',
            endTime: '0',
          });

          if (existsSync(filePath)) {
            unlinkSync(filePath);
            this.logger.log(
              LogLevel.INFO,
              LogSource.STREAM,
              `Successfully processed audio file: ${file}`,
            );
          }
        } catch (error) {
          // 에러 로그 빈도 제한 (1분에 한 번만 기록)
          const now = Date.now();
          const errorKey = `upload_error_${file}`;
          if (!this.lastErrorLog || now - this.lastErrorLog > 60000) {
            this.logger.error(
              LogSource.STREAM,
              `Upload failed for audio file ${file}: ${error.message}`,
            );
            this.lastErrorLog = now;
          }
        } finally {
          // 처리 완료 후 제거
          this.processingFiles.delete(objectName);
        }
      }

      // 이미지 파일 순차 처리
      for (const file of completedImageFiles) {
        const filePath = join(channelDir, file);
        const objectName = `channels/${channelId}/lives/${liveId}/images/${file}`;

        try {
          // DB에서 이미 처리된 파일인지 확인
          const existingFile = await this.fileRepository.findByObjectName(
            objectName,
          );
          if (existingFile) {
            this.logger.log(
              LogLevel.INFO,
              LogSource.STREAM,
              `File already processed: ${objectName}`,
            );
            // 이미 처리된 파일은 로컬에서 삭제
            if (existsSync(filePath)) {
              unlinkSync(filePath);
              this.logger.log(
                LogLevel.INFO,
                LogSource.STREAM,
                `Deleted processed image file: ${file}`,
              );
            }
            continue;
          }

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

          if (uploadedImageFiles.length === 0) {
            throw new Error('Failed to upload image file');
          }

          await this.saveFileToDB(channelId, liveId, filePath, FileType.IMAGE);

          if (existsSync(filePath)) {
            unlinkSync(filePath);
            this.logger.log(
              LogLevel.INFO,
              LogSource.STREAM,
              `Deleted uploaded image file: ${file}`,
            );
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

  private async saveFileToDB(
    channelId: string,
    liveId: string,
    filePath: string,
    fileType: FileType,
  ) {
    const stat = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const typeDir = fileType === FileType.AUDIO ? 'audios' : 'images';
    const minioPath = `${process.env.MINIO_BUCKET}/channels/${channelId}/lives/${liveId}/${typeDir}/${fileName}`;

    // 파일 이름에서 타임스탬프 추출 (예: audio_1234567890_001.aac)
    const timestampMatch = fileName.match(/_(\d+)_/);
    const recordedAt = timestampMatch
      ? new Date(parseInt(timestampMatch[1]))
      : new Date();

    await this.fileService.createFile({
      ownerId: channelId,
      filePath: minioPath,
      fileType,
      originalName: fileName,
      fileSize: stat.size,
      mimeType: fileType === FileType.AUDIO ? 'audio/aac' : 'image/jpeg',
      isPublic: true,
      metadata: {
        liveId,
        channelId,
        fileName,
        createdAt: new Date(),
        recordedAt,
      },
    });
  }

  async findByObjectName(objectName: string): Promise<File | null> {
    return this.fileRepository.findByObjectName(objectName);
  }

  private async uploadWithRetry(
    channelId: string,
    liveId: string,
    channelDir: string,
    files: { audioFiles: string[]; imageFiles: string[] },
    retries: number = this.UPLOAD_RETRY_COUNT,
  ): Promise<{ audioFiles: string[]; imageFiles: string[] }> {
    // MinIO 연결 상태 확인
    const isMinioHealthy = await this.minioService.checkHealth();
    if (!isMinioHealthy) {
      throw new Error('MinIO service is not available');
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.minioService.uploadStreamFiles(
          channelId,
          liveId,
          channelDir,
          files,
        );
        return result;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // 재시도 전 대기 (지수 백오프)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay));

        this.logger.log(
          LogLevel.INFO,
          LogSource.STREAM,
          `Upload retry ${attempt}/${retries} for ${
            files.audioFiles[0] || files.imageFiles[0]
          }`,
        );
      }
    }

    throw new Error('All upload attempts failed');
  }
}
