import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AudioJobDto, WhisperResultDto } from './dto/audio.dto';
import { Logger } from '@nestjs/common';

@Processor('audio-processing')
export class AudioProcessor {
  private readonly logger = new Logger(AudioProcessor.name);

  @Process('process-audio')
  async handleAudioJob(job: Job<AudioJobDto>) {
    try {
      this.logger.log(`Processing audio job: ${JSON.stringify(job.data)}`);
      // 여기서 DB에 오디오 정보 저장
      // 저장 후 Whisper 처리를 위해 큐에 추가
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing audio job: ${error.message}`);
      throw error;
    }
  }
}

@Processor('whisper-processing')
export class WhisperProcessor {
  private readonly logger = new Logger(WhisperProcessor.name);

  @Process('process-whisper')
  async handleWhisperResult(job: Job<WhisperResultDto>) {
    try {
      this.logger.log(`Processing whisper result: ${JSON.stringify(job.data)}`);
      // 여기서 Whisper 결과를 DB에 저장
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing whisper result: ${error.message}`);
      throw error;
    }
  }
}
