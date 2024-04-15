import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChatLog } from '../entities/channel-chat-log.entity';
import { Repository } from 'typeorm';
import { GenerateChannelChatLogDto } from '../dtos/generate-channel-cat-log.dto';

@Injectable()
export class ChannelChatLogRepository {
  constructor(
    @InjectRepository(ChannelChatLog)
    private repository: Repository<ChannelChatLog>,
  ) {}

  async generateChannelChatLog(
    generateChannelChatLogDto: GenerateChannelChatLogDto,
  ) {
    const instance = this.repository.create({
      ...generateChannelChatLogDto,
    });

    return await this.repository.save(instance);
  }
}
