import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { ChzzkService } from '../chzzk/chzzk.service';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);
  private readonly outputDir = 'recordings';
  private streamlinkProcess: any;
  private videoProcess: any;
  private audioProcess: any;
  private captureProcess: any;

  constructor(
    private readonly chzzkService: ChzzkService,
    private readonly minioService: MinioService,
  ) {
    // 녹화 디렉토리 생성
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async startRecording(channelId: string): Promise<string> {
    try {
      // Chzzk 라이브 정보 가져오기
      const live = await this.chzzkService.getChannelLiveDetail(channelId);

      const media = live.livePlayback.media;
      console.log(media);
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
        join(channelDir, 'video_%03d.mp4'),
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
        join(channelDir, 'audio_%03d.aac'),
      ]);

      // 캡처 프로세스
      this.captureProcess = spawn('ffmpeg', [
        '-i',
        '-',
        '-vf',
        'fps=0.1',
        join(channelDir, 'capture_%03d.jpg'),
      ]);

      // 파이프 연결
      this.streamlinkProcess.stdout.pipe(this.videoProcess.stdin);
      this.streamlinkProcess.stdout.pipe(this.audioProcess.stdin);
      this.streamlinkProcess.stdout.pipe(this.captureProcess.stdin);

      // 에러 핸들링
      this.streamlinkProcess.stderr.on('data', (data: Buffer) => {
        this.logger.error(`Streamlink error: ${data}`);
      });

      this.videoProcess.stderr.on('data', (data: Buffer) => {
        this.logger.error(`Video ffmpeg error: ${data}`);
      });

      this.audioProcess.stderr.on('data', (data: Buffer) => {
        this.logger.error(`Audio ffmpeg error: ${data}`);
      });

      this.captureProcess.stderr.on('data', (data: Buffer) => {
        this.logger.error(`Capture ffmpeg error: ${data}`);
      });

      // 오디오 파일이 생성될 때마다 텍스트로 변환하고 MinIO에 업로드
      this.audioProcess.on('close', async () => {
        const files = readdirSync(channelDir);
        const audioFiles = files.filter((file) => file.endsWith('.aac'));
        const imageFiles = files.filter((file) => file.endsWith('.jpg'));

        // MinIO에 파일 업로드
        const {
          audioFiles: uploadedAudioFiles,
          imageFiles: uploadedImageFiles,
        } = await this.minioService.uploadStreamFiles(channelId, channelDir);

        this.logger.log(
          `Uploaded ${uploadedAudioFiles.length} audio files and ${uploadedImageFiles.length} image files to MinIO`,
        );
      });

      return channelDir;
    } catch (error) {
      this.logger.error(`Error starting recording: ${error.message}`);
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
      this.logger.error(`Error stopping recording: ${error.message}`);
      throw error;
    }
  }
}
