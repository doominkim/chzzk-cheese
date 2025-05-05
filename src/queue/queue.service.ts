import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
  ) {}

  async addMessage(data: any) {
    await this.messageQueue.add('process-message', data);
  }

  async getJobCounts() {
    return await this.messageQueue.getJobCounts();
  }

  async cleanJobs() {
    await this.messageQueue.clean(0, 'completed');
    await this.messageQueue.clean(0, 'failed');
  }

  async pause() {
    await this.messageQueue.pause();
  }

  async resume() {
    await this.messageQueue.resume();
  }

  async reset() {
    await this.cleanJobs();
    await this.messageQueue.empty();
  }
}
