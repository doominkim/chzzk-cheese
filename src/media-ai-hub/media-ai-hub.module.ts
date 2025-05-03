import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MediaAiHubController } from './controllers/media-ai-hub.controller';
import { MediaAiHubService } from './services/media-ai-hub.service';

@Module({
  imports: [HttpModule],
  controllers: [MediaAiHubController],
  providers: [MediaAiHubService],
  exports: [MediaAiHubService],
})
export class MediaAiHubModule {}
