import { Injectable, Logger } from '@nestjs/common';
import { ChannelRepository } from '../repositories/channel.repository';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';
import { ModifyChannelDto } from '../dtos/modify-channel.dto';
import { FindChannelDto } from '../dtos/find-channel.dto';
import { FindChannelDtoV2 } from '../dtos/find-channel-v2.dto';

@Injectable()
export class ChannelService {
  private logger = new Logger(ChannelService.name);

  constructor(private channelRepository: ChannelRepository) {}

  async findChannels(findChannelDto?: FindChannelDto) {
    try {
      return await this.channelRepository.findChannels(findChannelDto);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async findChannelsV2(findChannelDto?: FindChannelDtoV2) {
    try {
      return await this.channelRepository.findChannelsV2(findChannelDto);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async findChannelsForBatch(findChannelDto?: FindChannelDto) {
    try {
      return await this.channelRepository.findChannelsForBatch(findChannelDto);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async findChannelById(id: number) {
    return await this.channelRepository.findChannelById(id);
  }

  async findChannelByUUID(uuid: string) {
    return await this.channelRepository.findChannelByUUID(uuid);
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

  async getRecentActivity(uuid: string) {
    const channel = await this.findChannelByUUID(uuid);

    return await this.channelRepository.getRecentActivityById(
      channel.id,
      channel.openLive,
    );
  }
  async getCalendar(uuid: string) {
    const channel = await this.findChannelByUUID(uuid);

    return await this.channelRepository.getCalendarValueById(channel.id);
  }
  async getLiveCategoryRankById(uuid: string) {
    const channel = await this.findChannelByUUID(uuid);

    return await this.channelRepository.getLiveCategoryRankById(channel.id);
  }
}
