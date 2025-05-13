import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { AudioJobDto, WhisperResultDto } from './dto/audio.dto';

interface HealthCheckTarget {
  url: string;
  lastCheck: number;
  isHealthy: boolean;
}

@Injectable()
export class QueueService {
  private healthChecks: Map<string, HealthCheckTarget> = new Map();
  private readonly HEALTH_CHECK_INTERVAL = 60 * 1000;

  constructor(
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
    @InjectQueue('whisper-processing') private readonly whisperQueue: Queue,
  ) {
    // 초기 헬스 체크 대상 등록
    this.addHealthCheckTarget(
      'whisper_worker1',
      'http://192.168.0.100:8000/health',
    );
  }

  addHealthCheckTarget(name: string, url: string) {
    this.healthChecks.set(name, {
      url,
      lastCheck: 0,
      isHealthy: true,
    });
  }

  private async checkHealth(): Promise<boolean> {
    const now = Date.now();
    let allHealthy = true;

    for (const [name, target] of this.healthChecks) {
      if (now - target.lastCheck < this.HEALTH_CHECK_INTERVAL) {
        if (!target.isHealthy) allHealthy = false;
        continue;
      }

      try {
        const response = await fetch(target.url);
        target.isHealthy = response.ok;
        target.lastCheck = now;
        if (!target.isHealthy) allHealthy = false;
      } catch (error) {
        target.isHealthy = false;
        target.lastCheck = now;
        allHealthy = false;
      }
    }

    return allHealthy;
  }

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
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      throw new Error('Service is not healthy');
    }

    const queue = this.getQueue(key);
    const jobName =
      key === 'audio-processing' ? 'process-audio' : 'process-whisper';
    const job = await queue.add(jobName, data, {
      attempts: 1,
      removeOnComplete: false,
      removeOnFail: false,
      timeout: 500 * 60 * 10, // 10 minutes
    });
    return job;
  }

  async getNextJob(key: string) {
    const queue = this.getQueue(key);
    const job = await queue.getNextJob();
    if (!job) return null;

    await job.progress(0);
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

  async completeJob(key: string, jobId: string, result?: any) {
    const queue = this.getQueue(key);
    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    if (state !== 'active') {
      throw new Error(`Job ${jobId} is not active (current state: ${state})`);
    }

    await job.moveToCompleted(result);

    return {
      id: job.id,
      status: 'completed',
      result,
    };
  }

  async failJob(key: string, jobId: string, error?: string) {
    const queue = this.getQueue(key);
    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    if (state !== 'active') {
      throw new Error(`Job ${jobId} is not active (current state: ${state})`);
    }

    await job.moveToFailed({ message: error || 'Job failed' });

    return {
      id: job.id,
      status: 'failed',
      error,
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

  async isJobInQueue(
    key: 'audio-processing' | 'whisper-processing',
    filePath: string,
  ): Promise<boolean> {
    const queue = this.getQueue(key);
    const jobs = await queue.getJobs(['active', 'waiting']);
    return jobs.some((job) => job.data.filePath === filePath);
  }
}
