import { Injectable, Logger } from '@nestjs/common';
import { ChannelLiveLogRepository } from '../repositories/channel-live-log.repository';
import { GenerateChannelLiveLogDto } from '../dtos/generate-channel-live-log.dto';

@Injectable()
export class ChannelLiveLogService {
  private logger = new Logger(ChannelLiveLogService.name);

  constructor(private channelLiveLogRepository: ChannelLiveLogRepository) {}

  async generateChannelLiveLog(
    generateChannelLiveLogDto: GenerateChannelLiveLogDto,
  ) {
    return await this.channelLiveLogRepository.generateChannelLiveLog(
      generateChannelLiveLogDto,
    );
  }
}
