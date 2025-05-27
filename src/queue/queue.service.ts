import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { AudioJobDto, WhisperResultDto } from './dto/audio.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

interface HealthCheckTarget {
  url: string;
  lastCheck: number;
  isHealthy: boolean;
  responseTime: number;
}

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private healthChecks: Map<string, HealthCheckTarget> = new Map();
  private wispherWorkers: Map<string, HealthCheckTarget> = new Map();
  private workersHealth = false;
  private readonly HEALTH_CHECK_INTERVAL = 60 * 1000;
  private readonly MAX_JOBS_TO_CHECK = 100; // 메모리 절약을 위해 검사할 최대 작업 수

  constructor(
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
    @InjectQueue('whisper-processing') private readonly whisperQueue: Queue,
  ) {
    this.wispherWorkers.set('whisper_worker1', {
      url: 'http://192.168.0.100:8000/health',
      lastCheck: 0,
      isHealthy: true,
      responseTime: 0,
    });

    this.wispherWorkers.set('whisper_worker2', {
      url: 'http://192.168.0.100:8001/health',
      lastCheck: 0,
      isHealthy: true,
      responseTime: 0,
    });

    this.wispherWorkers.set('whisper_worker3', {
      url: 'http://192.168.0.100:8002/health',
      lastCheck: 0,
      isHealthy: true,
      responseTime: 0,
    });

    this.wispherWorkers.set('whisper_worker4', {
      url: 'http://192.168.0.100:8003/health',
      lastCheck: 0,
      isHealthy: true,
      responseTime: 0,
    });
  }

  async onModuleInit() {
    // 시작 시 오래된 작업들 정리
    await this.cleanAllQueues();
    await this.addHealthCheckTarget();

    this.logger.log('Queue service initialized and cleaned');
  }

  // 큐 정리 작업 - 더 자주 실행 (1분마다)
  @Cron('0 * * * * *', {
    name: 'clean-queues',
  })
  async cleanQueues() {
    await this.cleanJobs('audio-processing');
    await this.cleanJobs('whisper-processing');

    // 강제 가비지 컬렉션
    if (global.gc) {
      global.gc();
    }
  }

  private async cleanAllQueues() {
    try {
      await Promise.all([
        this.cleanJobs('audio-processing'),
        this.cleanJobs('whisper-processing'),
      ]);
      this.logger.debug('All queues cleaned successfully');
    } catch (error) {
      this.logger.error('Failed to clean queues', error);
    }
  }

  getWorkersHealth(): Map<string, HealthCheckTarget> {
    return this.healthChecks;
  }

  async addHealthCheckTarget() {
    const now = Date.now();
    const promises = [];

    for (const [name, target] of this.wispherWorkers) {
      // 마지막 체크 후 HEALTH_CHECK_INTERVAL 시간이 지났는지 확인
      if (now - target.lastCheck < this.HEALTH_CHECK_INTERVAL) {
        continue;
      }

      promises.push(
        (async () => {
          try {
            const startTime = now;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃

            const response = await fetch(target.url, {
              signal: controller.signal,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });

            clearTimeout(timeoutId);
            const endTime = Date.now();

            target.isHealthy = response.ok;
            target.lastCheck = endTime;
            target.responseTime = endTime - startTime;
            this.healthChecks.set(name, target);
          } catch (error) {
            target.isHealthy = false;
            target.lastCheck = now;
            target.responseTime = -1;
            this.healthChecks.set(name, target);
          }
        })(),
      );
    }

    await Promise.all(promises);

    this.workersHealth = Array.from(this.healthChecks.values()).some(
      (target) => target.isHealthy,
    );
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
    if (!this.workersHealth) {
      throw new Error('Service is not healthy');
    }

    const queue = this.getQueue(key);
    const jobName =
      key === 'audio-processing' ? 'process-audio' : 'process-whisper';
    const job = await queue.add(jobName, data, {
      attempts: 1,
      removeOnComplete: 5, // 완료된 작업 5개만 유지
      removeOnFail: 5, // 실패한 작업 5개만 유지
      timeout: 100 * 60 * 10, // 10 minutes
      jobId: `${jobName}_${data.channelId}_${data.liveId}_${Date.now()}`, // unique job ID
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
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5분 전
    const oneMinuteAgo = Date.now() - 1 * 60 * 1000; // 1분 전

    try {
      // 완료된 작업 중 5분 이상 된 것 삭제
      await queue.clean(fiveMinutesAgo, 'completed', 0);
      // 실패한 작업 중 5분 이상 된 것 삭제
      await queue.clean(fiveMinutesAgo, 'failed', 0);
      // 실행 중인 작업 중 5분 이상 된 것 삭제
      await queue.clean(fiveMinutesAgo, 'active', 0);
      // 대기 중인 작업 중 1분 이상 된 것 삭제 (더 적극적으로)
      await queue.clean(oneMinuteAgo, 'wait', 0);
      // 지연된 작업 중 1분 이상 된 것 삭제
      await queue.clean(oneMinuteAgo, 'delayed', 0);

      this.logger.debug(`Queue ${key} cleaned successfully`);
    } catch (error) {
      this.logger.error(`Failed to clean queue ${key}`, error);
    }
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
    try {
      const queue = this.getQueue(key);
      // 메모리 절약을 위해 검사할 작업 수 제한
      const jobs = await queue.getJobs(
        ['active', 'waiting'],
        0,
        this.MAX_JOBS_TO_CHECK,
      );

      // 큰 배열 순회 대신 조기 반환 사용
      for (const job of jobs) {
        if (job.data?.filePath === filePath) {
          return true;
        }
      }
      return false;
    } catch (error) {
      this.logger.error(`Error checking job in queue: ${error.message}`);
      return false;
    }
  }
}
