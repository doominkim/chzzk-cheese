import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AudioJobDto, WhisperResultDto } from './dto/audio.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('audio-processing') private readonly audioQueue: Queue,
    @InjectQueue('whisper-processing') private readonly whisperQueue: Queue,
  ) {}

  async addAudioJob(data: AudioJobDto) {
    await this.audioQueue.add('process-audio', data);
  }

  async addWhisperResult(data: WhisperResultDto) {
    await this.whisperQueue.add('process-whisper', data);
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
