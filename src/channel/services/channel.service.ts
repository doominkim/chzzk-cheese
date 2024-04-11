import { Injectable, Logger } from '@nestjs/common';
import { ChannelRepository } from '../repositories/channel.repository';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';
import { ModifyChannelDto } from '../dtos/modify-channel.dto';

@Injectable()
export class ChannelService {
  private logger = new Logger(ChannelService.name);

  constructor(private channelRepository: ChannelRepository) {}

  async findChannels() {
    try {
      return await this.channelRepository.findChannels();
    } catch (e) {
      this.logger.error(e);
    }
  }

  async findChannelById(id: number) {
    return await this.channelRepository.findChannelById(id);
  }

  async findChannelByChannelId(channelId: string) {
    return await this.channelRepository.findChannelByChannelId(channelId);
  }

  async generateChannel(generateChannelDto: GenerateChannelDto) {
    try {
      return await this.channelRepository.generateChannel(generateChannelDto);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async modifyChannel(id: number, modifyChannelDto: ModifyChannelDto) {
    return await this.channelRepository.modifyChannel(id, modifyChannelDto);
  }

  async getRecentActivity(channelId: string) {
    const channel = await this.findChannelByChannelId(channelId);

    return await this.channelRepository.getRecentActivityById(
      channel.id,
      channel.openLive,
    );
  }
  async getCalendar(id: string) {
    const channel = await this.findChannelByChannelId(id);

    return await this.channelRepository.getCalendarValueById(channel.id);
  }
  async getRank(id: string) {}
}
