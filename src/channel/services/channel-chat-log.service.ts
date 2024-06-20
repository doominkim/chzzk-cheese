import { Injectable, Logger } from '@nestjs/common';
import { ChannelChatLogRepository } from '../repositories/channel-chat-log.repository';
import { GenerateChannelChatLogDto } from '../dtos/generate-channel-cat-log.dto';
import { GetDonationRankDto } from '../dtos/get-donation-rank.dto';
import { GetDonationDto } from '../dtos/get-donation.dto';
import { GetActiveUserRankDto } from '../dtos/get-most-active-user-rank.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class ChannelChatLogService {
  private logger = new Logger(ChannelChatLogService.name);

  constructor(private channelChatLogRepository: ChannelChatLogRepository) {}

  async generateChannelChatLog(
    generateChannelChatLogDto: GenerateChannelChatLogDto,
    entityManager?: EntityManager,
  ) {
    return await this.channelChatLogRepository.generateChannelChatLog(
      generateChannelChatLogDto,
      entityManager,
    );
  }

  async generateChannelChatLogs(
    generateChannelChatLogDtos: GenerateChannelChatLogDto[],
    entityManager?: EntityManager,
  ) {
    return await this.channelChatLogRepository.generateChannelChatLogs(
      generateChannelChatLogDtos,
      entityManager,
    );
  }

  async getDonationRank(getDonationRankDto: GetDonationRankDto) {
    return await this.channelChatLogRepository.getDonationRank(
      getDonationRankDto,
    );
  }

  async getDonations(getDonationDto: GetDonationDto) {
    return await this.channelChatLogRepository.getDonations(getDonationDto);
  }

  async getActiveUserRank(getActiveUserRank: GetActiveUserRankDto) {
    return await this.channelChatLogRepository.getActiveUserRank(
      getActiveUserRank,
    );
  }
}
