import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WhisperResultDto } from './dto/audio.dto';
import { Logger } from '@nestjs/common';
import { ChannelLiveTranscriptService } from 'src/channel/services/channel-live-transcript.service';
import { ChannelLiveTranscript } from 'src/channel/entities/channel-live-transcript.entity';

@Processor('whisper-processing')
export class WhisperProcessor {
  private readonly logger = new Logger(WhisperProcessor.name);

  constructor(
    private readonly channelLiveTranscriptService: ChannelLiveTranscriptService,
  ) {}

  @Process('process-whisper')
  async handleWhisperResult(job: Job<WhisperResultDto>) {
    try {
      this.logger.log(`Processing whisper result: ${JSON.stringify(job.data)}`);

      const transcript = new ChannelLiveTranscript();
      transcript.channelId = job.data.channelId;
      transcript.liveId = job.data.liveId;
      transcript.startTime = job.data.startTime;
      transcript.endTime = job.data.endTime;
      transcript.text = job.data.text;
      transcript.fileUrl = job.data.filePath;

      await this.channelLiveTranscriptService.create(transcript);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing whisper result: ${error.message}`);
      throw error;
    }
  }
}
