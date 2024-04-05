import { Injectable } from '@nestjs/common';
import { ChzzkRepository } from './chzzk.repository';

@Injectable()
export class ExportChzzkService {
  constructor(private chzzkRepository: ChzzkRepository) {}

  async getChannelsByKeyword(keyword: string) {
    return this.chzzkRepository.getChannelsByKeyword(keyword);
  }
  async getChannelById(channelId: string) {
    return this.chzzkRepository.getChannelById(channelId);
  }
  async getChannelStatus(channelId: string) {
    return this.chzzkRepository.getChannelStatus(channelId);
  }
  async getChannelDetails(channelId: string) {
    return this.chzzkRepository.getChannelDetails(channelId);
  }
  async joinChannel(channelId: string) {
    return this.chzzkRepository.joinChannel(channelId);
  }
  async leaveChannel(channelId: string) {
    return this.chzzkRepository.leaveChannel(channelId);
  }
}
