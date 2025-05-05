import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('message-queue')
export class QueueProcessor {
  @Process('process-message')
  async handleMessage(job: Job) {
    try {
      console.log('Processing message:', job.data);
      // 여기에 실제 메시지 처리 로직 구현
      return { success: true };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }
}
