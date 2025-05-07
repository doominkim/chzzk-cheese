import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { QueueService } from './queue.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AudioJobDto, WhisperResultDto } from './dto/audio.dto';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post(':key')
  @ApiOperation({ summary: 'Add job to queue' })
  @ApiParam({
    name: 'key',
    enum: ['audio-processing', 'whisper-processing'],
    description: 'Queue name',
  })
  @ApiBody({
    description: 'Job data',
    type: AudioJobDto,
    examples: {
      audio: {
        summary: 'Audio job example',
        value: {
          filePath: '/path/to/audio.wav',
          channelId: '123',
          liveId: '456',
          startTime: '2024-03-05T12:00:00Z',
          endTime: '2024-03-05T12:01:00Z',
        },
      },
      whisper: {
        summary: 'Whisper result example',
        value: {
          channelId: '123',
          liveId: '456',
          filePath: '/path/to/audio.wav',
          startTime: '2024-03-05T12:00:00Z',
          endTime: '2024-03-05T12:01:00Z',
          text: '안녕하세요. 오늘은 좋은 날씨네요.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Job added successfully',
    schema: {
      example: {
        jobId: '123',
        message: 'Job added to queue',
      },
    },
  })
  async addJob(
    @Param('key') key: string,
    @Body() data: AudioJobDto | WhisperResultDto,
  ) {
    const job = await this.queueService.addJob(key, data);
    return { jobId: job.id };
  }

  @Post(':key/next')
  @ApiOperation({ summary: 'Get next job from queue' })
  @ApiParam({
    name: 'key',
    enum: ['audio-processing', 'whisper-processing'],
    description: 'Queue name',
  })
  @ApiResponse({
    status: 200,
    description: 'Next job retrieved successfully',
    schema: {
      example: {
        id: '123',
        data: {
          filePath: '/path/to/audio.wav',
          channelId: '123',
          liveId: '456',
          startTime: '2024-03-05T12:00:00Z',
          endTime: '2024-03-05T12:01:00Z',
          text: '안녕하세요. 오늘은 좋은 날씨네요.',
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
  async getNextJob(@Param('key') key: string) {
    const job = await this.queueService.getNextJob(key);
    if (!job) {
      return { message: 'No jobs available' };
    }
    return job;
  }

  @Get(':key/:jobId')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({
    name: 'key',
    enum: ['audio-processing', 'whisper-processing'],
    description: 'Queue name',
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Job retrieved successfully',
    schema: {
      example: {
        id: '123',
        data: {
          filePath: '/path/to/audio.wav',
          channelId: '123',
          liveId: '456',
          startTime: '2024-03-05T12:00:00Z',
          endTime: '2024-03-05T12:01:00Z',
          text: '안녕하세요. 오늘은 좋은 날씨네요.',
        },
        status: 'completed',
        progress: 100,
        attemptsMade: 1,
        timestamp: 1709635200000,
        processedOn: 1709635201000,
        finishedOn: 1709635202000,
      },
    },
  })
  async getJob(@Param('key') key: string, @Param('jobId') jobId: string) {
    const job = await this.queueService.getJob(key, jobId);
    if (!job) {
      return { message: 'Job not found' };
    }
    return job;
  }

  @Get(':key/status')
  @ApiOperation({ summary: 'Get queue status' })
  @ApiParam({
    name: 'key',
    enum: ['audio-processing', 'whisper-processing'],
    description: 'Queue name',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue status retrieved successfully',
    schema: {
      example: {
        waiting: 5,
        active: 1,
        completed: 10,
        failed: 0,
        delayed: 0,
      },
    },
  })
  async getQueueStatus(@Param('key') key: string) {
    return await this.queueService.getJobCounts(key);
  }

  @Post(':key/clean')
  @ApiOperation({ summary: 'Clean completed and failed jobs' })
  @ApiParam({
    name: 'key',
    enum: ['audio-processing', 'whisper-processing'],
    description: 'Queue name',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue cleaned successfully',
    schema: {
      example: { message: 'Queue cleaned successfully' },
    },
  })
  async cleanQueue(@Param('key') key: string) {
    await this.queueService.cleanJobs(key);
    return { message: 'Queue cleaned successfully' };
  }

  @Post(':key/pause')
  @ApiOperation({ summary: 'Pause queue' })
  @ApiParam({
    name: 'key',
    enum: ['audio-processing', 'whisper-processing'],
    description: 'Queue name',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue paused successfully',
    schema: {
      example: { message: 'Queue paused successfully' },
    },
  })
  async pauseQueue(@Param('key') key: string) {
    await this.queueService.pauseQueue(key);
    return { message: 'Queue paused successfully' };
  }

  @Post(':key/resume')
  @ApiOperation({ summary: 'Resume queue' })
  @ApiParam({
    name: 'key',
    enum: ['audio-processing', 'whisper-processing'],
    description: 'Queue name',
  })
  @ApiResponse({
    status: 200,
    description: 'Queue resumed successfully',
    schema: {
      example: { message: 'Queue resumed successfully' },
    },
  })
  async resumeQueue(@Param('key') key: string) {
    await this.queueService.resumeQueue(key);
    return { message: 'Queue resumed successfully' };
  }
}
