import { Controller, Post, Body } from '@nestjs/common';
import { MediaAiHubService } from '../services/media-ai-hub.service';
import { WhisperTranscribeDto } from '../dtos/whisper-transcribe.dto';

@Controller('media-ai-hub')
export class MediaAiHubController {
  constructor(private readonly mediaAiHubService: MediaAiHubService) {}

  @Post('whisper/transcribe')
  async transcribeAudio(@Body() whisperTranscribeDto: WhisperTranscribeDto) {
    return this.mediaAiHubService.transcribeAudio(whisperTranscribeDto);
  }
}
