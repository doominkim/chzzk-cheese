import { Controller, Post, Get, Body } from '@nestjs/common';
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
      example: { message: 'Audio job added to queue' },
    },
  })
  async addAudioJob(@Body() data: AudioJobDto) {
    await this.queueService.addAudioJob(data);
    return { message: 'Audio job added to queue' };
  }

  @Post('whisper')
  @ApiOperation({ summary: 'Whisper 결과 추가' })
  @ApiResponse({
    status: 201,
    description: 'Whisper 결과가 큐에 추가됨',
    schema: {
      example: { message: 'Whisper result added to queue' },
    },
  })
  async addWhisperResult(@Body() data: WhisperResultDto) {
    await this.queueService.addWhisperResult(data);
    return { message: 'Whisper result added to queue' };
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
