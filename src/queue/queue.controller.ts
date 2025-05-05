import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageDto, BulkMessageDto } from './dto/message.dto';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('add')
  @ApiOperation({ summary: '큐에 메시지 추가' })
  @ApiResponse({
    status: 201,
    description: '메시지가 큐에 추가됨',
    schema: {
      example: { message: 'Message added to queue' },
    },
  })
  async addMessage(@Body() data: MessageDto) {
    await this.queueService.addMessage(data);
    return { message: 'Message added to queue' };
  }

  @Get('status')
  @ApiOperation({ summary: '큐 상태 확인' })
  @ApiResponse({
    status: 200,
    description: '큐 상태 반환',
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
  async getStatus() {
    return await this.queueService.getJobCounts();
  }

  @Post('clean')
  @ApiOperation({ summary: '완료/실패된 작업 정리' })
  @ApiResponse({
    status: 200,
    description: '작업이 정리됨',
    schema: {
      example: { message: 'Jobs cleaned' },
    },
  })
  async cleanJobs() {
    await this.queueService.cleanJobs();
    return { message: 'Jobs cleaned' };
  }

  @Post('reset')
  @ApiOperation({ summary: '큐 초기화' })
  @ApiResponse({
    status: 200,
    description: '큐가 초기화됨',
    schema: {
      example: { message: 'Queue reset' },
    },
  })
  async resetQueue() {
    await this.queueService.reset();
    return { message: 'Queue reset' };
  }

  @Post('pause')
  @ApiOperation({ summary: '큐 일시정지' })
  @ApiResponse({
    status: 200,
    description: '큐가 일시정지됨',
    schema: {
      example: { message: 'Queue paused' },
    },
  })
  async pauseQueue() {
    await this.queueService.pause();
    return { message: 'Queue paused' };
  }

  @Post('resume')
  @ApiOperation({ summary: '큐 재개' })
  @ApiResponse({
    status: 200,
    description: '큐가 재개됨',
    schema: {
      example: { message: 'Queue resumed' },
    },
  })
  async resumeQueue() {
    await this.queueService.resume();
    return { message: 'Queue resumed' };
  }

  @Post('bulk-add')
  @ApiOperation({ summary: '대량의 메시지 추가' })
  @ApiResponse({
    status: 201,
    description: '메시지들이 큐에 추가됨',
    schema: {
      example: { message: '2 messages added to queue' },
    },
  })
  async bulkAddMessages(@Body() data: BulkMessageDto) {
    const promises = data.messages.map((message) =>
      this.queueService.addMessage(message),
    );
    await Promise.all(promises);
    return { message: `${data.messages.length} messages added to queue` };
  }
}
