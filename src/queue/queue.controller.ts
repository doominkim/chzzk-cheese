import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AudioJobDto, WhisperResultDto } from './dto/audio.dto';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('audio')
  @ApiOperation({ summary: '오디오 처리 작업 추가' })
  @ApiResponse({
    status: 201,
    description: '오디오 작업이 큐에 추가됨',
    schema: {
      example: {
        jobId: '123',
        message: 'Audio job added to queue',
      },
    },
  })
  async addAudioJob(@Body() data: AudioJobDto) {
    const job = await this.queueService.addAudioJob(data);
    return {
      jobId: job.id,
      message: 'Audio job added to queue',
    };
  }

  @Post('whisper')
  @ApiOperation({ summary: 'Whisper 결과 추가' })
  @ApiResponse({
    status: 201,
    description: 'Whisper 결과가 큐에 추가됨',
    schema: {
      example: {
        jobId: '123',
        message: 'Whisper result added to queue',
      },
    },
  })
  async addWhisperResult(@Body() data: WhisperResultDto) {
    const job = await this.queueService.addWhisperResult(data);
    return {
      jobId: job.id,
      message: 'Whisper result added to queue',
    };
  }

  @Post('audio/next')
  @ApiOperation({ summary: '다음 오디오 작업 가져오기' })
  @ApiResponse({
    status: 200,
    description: '다음 오디오 작업 반환',
    schema: {
      example: {
        id: '123',
        data: {
          filePath: '/path/to/audio.wav',
          channelId: '123',
          liveId: '456',
          startTime: '2024-03-05T12:00:00Z',
          endTime: '2024-03-05T12:01:00Z',
        },
        status: 'active',
        progress: 0,
        attemptsMade: 0,
        timestamp: 1709635200000,
        processedOn: 1709635201000,
        finishedOn: null,
      },
    },
  })
  async getNextAudioJob() {
    const job = await this.queueService.getNextAudioJob();
    if (!job) {
      return { message: 'No jobs available' };
    }
    return job;
  }

  @Post('whisper/next')
  @ApiOperation({ summary: '다음 Whisper 작업 가져오기' })
  @ApiResponse({
    status: 200,
    description: '다음 Whisper 작업 반환',
    schema: {
      example: {
        id: '123',
        data: {
          channelId: '123',
          liveId: '456',
          filePath: '/path/to/audio.wav',
          startTime: '2024-03-05T12:00:00Z',
          endTime: '2024-03-05T12:01:00Z',
          text: '변환된 텍스트',
        },
        status: 'active',
        progress: 0,
        attemptsMade: 0,
        timestamp: 1709635200000,
        processedOn: 1709635201000,
        finishedOn: null,
      },
    },
  })
  async getNextWhisperJob() {
    const job = await this.queueService.getNextWhisperJob();
    if (!job) {
      return { message: 'No jobs available' };
    }
    return job;
  }

  @Get('audio/status')
  @ApiOperation({ summary: '오디오 큐 상태 확인' })
  @ApiResponse({
    status: 200,
    description: '오디오 큐 상태 반환',
    schema: {
      example: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      },
    },
  })
  async getAudioStatus() {
    return await this.queueService.getAudioJobCounts();
  }

  @Get('whisper/status')
  @ApiOperation({ summary: 'Whisper 큐 상태 확인' })
  @ApiResponse({
    status: 200,
    description: 'Whisper 큐 상태 반환',
    schema: {
      example: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      },
    },
  })
  async getWhisperStatus() {
    return await this.queueService.getWhisperJobCounts();
  }

  @Get('audio/job')
  @ApiOperation({ summary: '오디오 job 정보 조회' })
  @ApiResponse({
    status: 200,
    description: 'job 정보 반환',
  })
  async getAudioJob(@Query('jobId') jobId: string) {
    return await this.queueService.getAudioJob(jobId);
  }

  @Get('whisper/job')
  @ApiOperation({ summary: 'Whisper job 정보 조회' })
  @ApiResponse({
    status: 200,
    description: 'job 정보 반환',
  })
  async getWhisperJob(@Query('jobId') jobId: string) {
    return await this.queueService.getWhisperJob(jobId);
  }

  @Post('audio/clean')
  @ApiOperation({ summary: '오디오 큐 정리' })
  @ApiResponse({
    status: 200,
    description: '오디오 큐가 정리됨',
    schema: {
      example: { message: 'Audio queue cleaned' },
    },
  })
  async cleanAudioJobs() {
    await this.queueService.cleanAudioJobs();
    return { message: 'Audio queue cleaned' };
  }

  @Post('whisper/clean')
  @ApiOperation({ summary: 'Whisper 큐 정리' })
  @ApiResponse({
    status: 200,
    description: 'Whisper 큐가 정리됨',
    schema: {
      example: { message: 'Whisper queue cleaned' },
    },
  })
  async cleanWhisperJobs() {
    await this.queueService.cleanWhisperJobs();
    return { message: 'Whisper queue cleaned' };
  }

  @Post('audio/pause')
  @ApiOperation({ summary: '오디오 큐 일시정지' })
  @ApiResponse({
    status: 200,
    description: '오디오 큐가 일시정지됨',
    schema: {
      example: { message: 'Audio queue paused' },
    },
  })
  async pauseAudioQueue() {
    await this.queueService.pauseAudioQueue();
    return { message: 'Audio queue paused' };
  }

  @Post('audio/resume')
  @ApiOperation({ summary: '오디오 큐 재개' })
  @ApiResponse({
    status: 200,
    description: '오디오 큐가 재개됨',
    schema: {
      example: { message: 'Audio queue resumed' },
    },
  })
  async resumeAudioQueue() {
    await this.queueService.resumeAudioQueue();
    return { message: 'Audio queue resumed' };
  }

  @Post('whisper/pause')
  @ApiOperation({ summary: 'Whisper 큐 일시정지' })
  @ApiResponse({
    status: 200,
    description: 'Whisper 큐가 일시정지됨',
    schema: {
      example: { message: 'Whisper queue paused' },
    },
  })
  async pauseWhisperQueue() {
    await this.queueService.pauseWhisperQueue();
    return { message: 'Whisper queue paused' };
  }

  @Post('whisper/resume')
  @ApiOperation({ summary: 'Whisper 큐 재개' })
  @ApiResponse({
    status: 200,
    description: 'Whisper 큐가 재개됨',
    schema: {
      example: { message: 'Whisper queue resumed' },
    },
  })
  async resumeWhisperQueue() {
    await this.queueService.resumeWhisperQueue();
    return { message: 'Whisper queue resumed' };
  }
}
