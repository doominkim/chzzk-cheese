import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Channel } from 'src/channel/entities/channel.entity';
import { ChannelService } from 'src/channel/services/channel.service';
import { ChzzkService } from 'src/chzzk/chzzk.service';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private chzzkService: ChzzkService,
    private channelService: ChannelService,
  ) {}

  @Cron('*/10 * * * * *', {
    name: 'trackingChannels',
  })
  async trackingChannels() {
    try {
      const channels = await this.channelService.findChannels();

      for (const channel of channels) {
        await this.trackingChannel(channel);
      }

      this.logger.log(`[${this.trackingChannels.name}]`);
    } catch (e) {
      this.logger.error('e');
    }
  }
  async trackingChannel(channel: Channel) {
    const { channelId } = channel;

    const chzzkChannel = await this.chzzkService.getChannelById(channelId);

    console.log(chzzkChannel);

    const chzzkChannelDetail = await this.chzzkService.getChannelLiveDetail(
      channelId,
    );

    this.logger.debug(chzzkChannelDetail);
  }
}
