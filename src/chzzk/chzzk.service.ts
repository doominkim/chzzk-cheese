import { Injectable } from '@nestjs/common';
import { ChzzkModule as Chzzk } from 'chzzk-z';

@Injectable()
export class ChzzkService {
  chzzk = new Chzzk();

  async getChannelsByKeyword(keyword: string) {
    console.log('keyword =>', keyword);
    const channels = await this.chzzk.channel.findByKeyword(keyword);
    for (const channel of channels['data']) {
      console.log(channel);
    }

    return channels['data'];
  }

  async getChannelById(channelId: string) {
    return await this.chzzk.channel.findById(channelId);
  }

  async getChannelStatus(channelId: string) {
    return this.chzzk.live.findStatusByChannelId(channelId);
  }
}
