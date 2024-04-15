import { Injectable, Logger } from '@nestjs/common';
import { ChannelChatLogRepository } from '../repositories/channel-chat-log.repository';
import { GenerateChannelChatLogDto } from '../dtos/generate-channel-cat-log.dto';

@Injectable()
export class ChannelChatLogService {
  private logger = new Logger(ChannelChatLogService.name);

  constructor(private channelChatLogRepository: ChannelChatLogRepository) {}

  async generateChannelChatLog(
    generateChannelChatLogDto: GenerateChannelChatLogDto,
  ) {
    return await this.channelChatLogRepository.generateChannelChatLog(
      generateChannelChatLogDto,
    );
  }
}
