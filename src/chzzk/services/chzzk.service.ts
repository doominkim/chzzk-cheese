import { Injectable } from '@nestjs/common';
import { ChzzkModule as Chzzk } from 'chzzk-z';

@Injectable()
export class ChzzkService {
  chzzk = new Chzzk();

  async getChannelsByKeyword(keyword: string) {
    const channels = await this.chzzk.channel.findByKeyword(keyword);

    return channels['data'];
  }

  async getChannelById(channelId: string) {
    return await this.chzzk.channel.findById(channelId);
  }

  async getChannelStatus(channelId: string) {
    return this.chzzk.live.findStatusByChannelId(channelId);
  }
}
