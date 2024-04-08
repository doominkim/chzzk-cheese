import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { plainToInstance } from 'class-transformer';
import { ModifyChannelDto } from 'src/channel/dtos/modify-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { ChannelService } from 'src/channel/services/channel.service';
import { ChzzkService } from 'src/chzzk/chzzk.service';
import { ChzzkChannelDto } from 'src/chzzk/dtos/chzzk-channel.dto';
import { compareObjects } from 'src/common/helpers/common-formmating.helper';
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
      this.logger.error(e);
    }
  }
  async trackingChannel(channel: Channel) {
    const { id, channelId } = channel;

    const chzzkChannel = await this.chzzkService.getChannelById(channelId);

    const isUpdate = this.isUpdateChannel(channel, chzzkChannel);

    if (isUpdate) {
      const modifyChannelDto = new ModifyChannelDto();
      modifyChannelDto.channelName = chzzkChannel.channelName;
      modifyChannelDto.channelImageUrl = chzzkChannel.channelImageUrl;
      modifyChannelDto.channelDescription = chzzkChannel.channelDescription;
      modifyChannelDto.follower = chzzkChannel.followerCount;
      modifyChannelDto.openLive = chzzkChannel.openLive;
      await this.channelService.modifyChannel(id, modifyChannelDto);
    }

    if (chzzkChannel.openLive) {
      const chzzkChannelDetail = await this.chzzkService.getChannelLiveDetail(
        channelId,
      );
    }
  }
  isUpdateChannel(channel: Channel, chzzkChannel: ChzzkChannelDto): boolean {
    if (
      channel.channelName !== chzzkChannel.channelName ||
      channel.channelDescription !== chzzkChannel.channelDescription ||
      channel.channelImageUrl !== chzzkChannel.channelImageUrl ||
      channel.openLive !== chzzkChannel.openLive ||
      channel.follower !== chzzkChannel.followerCount
    ) {
      return true;
    }
    return false;
  }
}
