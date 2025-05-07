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

  async addAudioJob(data: AudioJobDto) {
    const job = await this.audioQueue.add('process-audio', data, {
      attempts: 1,
      removeOnComplete: false,
      removeOnFail: false,
    });
    return job;
  }

  async addWhisperResult(data: WhisperResultDto) {
    const job = await this.whisperQueue.add('process-whisper', data, {
      attempts: 1,
      removeOnComplete: false,
      removeOnFail: false,
    });
    return job;
  }

  async getNextAudioJob() {
    const job = await this.audioQueue.getNextJob();
    if (!job) return null;

    // job을 active 상태로 변경
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

  async getNextWhisperJob() {
    const job = await this.whisperQueue.getNextJob();
    if (!job) return null;

    // job을 active 상태로 변경
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

  async getAudioJob(jobId: string) {
    const job = await this.audioQueue.getJob(jobId);
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

  async getWhisperJob(jobId: string) {
    const job = await this.whisperQueue.getJob(jobId);
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

  async getAudioJobCounts() {
    return await this.audioQueue.getJobCounts();
  }

  async getWhisperJobCounts() {
    return await this.whisperQueue.getJobCounts();
  }

  async cleanAudioJobs() {
    await this.audioQueue.clean(0, 'completed');
    await this.audioQueue.clean(0, 'failed');
  }

  async cleanWhisperJobs() {
    await this.whisperQueue.clean(0, 'completed');
    await this.whisperQueue.clean(0, 'failed');
  }

  async pauseAudioQueue() {
    await this.audioQueue.pause();
  }

  async resumeAudioQueue() {
    await this.audioQueue.resume();
  }

  async pauseWhisperQueue() {
    await this.whisperQueue.pause();
  }

  async resumeWhisperQueue() {
    await this.whisperQueue.resume();
  }
}
