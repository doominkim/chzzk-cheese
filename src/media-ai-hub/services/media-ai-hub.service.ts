import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { WhisperTranscribeDto } from '../dtos/whisper-transcribe.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MediaAiHubService {
  private readonly logger = new Logger(MediaAiHubService.name);
  private readonly baseUrl = 'http://0.0.0.0:8000';

  constructor(private readonly httpService: HttpService) {}

  async transcribeAudio(whisperTranscribeDto: WhisperTranscribeDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/whisper/transcribe`,
          whisperTranscribeDto,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Whisper transcribe error: ${error.message}`);
      throw error;
    }
  }
}
