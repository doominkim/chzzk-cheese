import { Injectable } from '@nestjs/common';
import { ChzzkRepository } from './chzzk.repository';

@Injectable()
export class ChzzkService {
  constructor(private chzzkRepository: ChzzkRepository) {}

  async getChannelsByKeyword(keyword: string) {
    return this.chzzkRepository.getChannelsByKeyword(keyword);
  }

  async getChannelById(channelId: string) {
    return this.chzzkRepository.getChannelById(channelId);
  }

  async getChannelLiveStatus(channelId: string) {
    return this.chzzkRepository.getChannelLiveStatus(channelId);
  }

  async getChannelLiveDetail(channelId: string) {
    return this.chzzkRepository.getChannelLiveDetail(channelId);
  }

  async joinChannel(channelId: string) {
    return this.chzzkRepository.joinChannel(channelId);
  }

  async leaveChannel(channelId: string) {
    return this.chzzkRepository.leaveChannel(channelId);
  }
}
