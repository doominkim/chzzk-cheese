import { Injectable } from '@nestjs/common';
import { ChzzkModule as Chzzk } from 'chzzk-z';

@Injectable()
export class ChannelService {
  chzzk = new Chzzk();

  async getChannelsByKeyword(keyword: string) {
    const channels = await this.chzzk.channel.findByKeyword(keyword);
    console.log(channels);
    return channels['data'];
  }

  async getChannelById(channelId: string) {
    const channel = await this.chzzk.channel.findById(channelId);

    console.log(channel);
    return channel;
  }

  async getChannelStatus(channelId: string) {
    return this.chzzk.live.findStatusByChannelId(channelId);
  }

  async getChannelDetails(channelId: string) {
    return this.chzzk.live.findDetailByChannelId(channelId);
  }

  async joinChannel(channelId: string) {
    try {
      await this.chzzk.chat.join(channelId);
      await this.chzzk.chat.connect();
    } catch (error) {
      throw error;
    }
  }

  async leaveChannel(channelId: string) {
    return await this.chzzk.chat.disconnect();
  }
}
