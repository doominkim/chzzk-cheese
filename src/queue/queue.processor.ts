import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WhisperResultDto } from './dto/audio.dto';
import { Logger } from '@nestjs/common';

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
