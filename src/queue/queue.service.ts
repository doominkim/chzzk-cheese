import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { AudioJobDto, WhisperResultDto } from './dto/audio.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
    @InjectQueue('whisper-processing') private readonly whisperQueue: Queue,
  ) {}

  private getQueue(key: string): Queue {
    switch (key) {
      case 'audio-processing':
        return this.audioQueue;
      case 'whisper-processing':
        return this.whisperQueue;
      default:
        throw new Error(`Invalid queue key: ${key}`);
    }
  }

  async addJob(key: string, data: AudioJobDto | WhisperResultDto) {
    const queue = this.getQueue(key);
    const jobName =
      key === 'audio-processing' ? 'process-audio' : 'process-whisper';
    const job = await queue.add(jobName, data, {
      attempts: 1,
      removeOnComplete: false,
      removeOnFail: false,
    });
    return job;
  }

  async getNextJob(key: string) {
    const queue = this.getQueue(key);
    const job = await queue.getNextJob();
    if (!job) return null;

    await job.takeLock();

    return {
      id: job.id,
      data: job.data,
      status: await job.getState(),
      progress: job.progress(),
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  async getJob(key: string, jobId: string) {
    const queue = this.getQueue(key);
    const job = await queue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      data: job.data,
      status: await job.getState(),
      progress: job.progress(),
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  async getJobCounts(key: string) {
    const queue = this.getQueue(key);
    return await queue.getJobCounts();
  }

  async cleanJobs(key: string) {
    const queue = this.getQueue(key);
    await queue.clean(0, 'completed');
    await queue.clean(0, 'failed');
  }

  async pauseQueue(key: string) {
    const queue = this.getQueue(key);
    await queue.pause();
  }

  async resumeQueue(key: string) {
    const queue = this.getQueue(key);
    await queue.resume();
  }
}
