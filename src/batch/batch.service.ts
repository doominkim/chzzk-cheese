import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChannelLiveDto } from 'src/channel/dtos/channel-live.dto';
import { GenerateChannelLiveLogDto } from 'src/channel/dtos/generate-channel-live-log.dto';
import { GenerateChannelLiveDto } from 'src/channel/dtos/generate-channel-live.dto';
import { ModifyChannelDto } from 'src/channel/dtos/modify-channel.dto';
import { Channel } from 'src/channel/entities/channel.entity';
import { ChannelLiveCategoryService } from 'src/channel/services/channel-live-category.service';
import { ChannelLiveLogService } from 'src/channel/services/channel-live-log.service';
import { ChannelLiveService } from 'src/channel/services/channel-live.service';
import { ChannelService } from 'src/channel/services/channel.service';
import { ChzzkService } from 'src/chzzk/chzzk.service';
import { ChzzkChannelDto } from 'src/chzzk/dtos/chzzk-channel.dto';
@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private chzzkService: ChzzkService,
    private channelService: ChannelService,
    private channelLiveService: ChannelLiveService,
    private channelLiveLogService: ChannelLiveLogService,
    private channelLiveCategoryService: ChannelLiveCategoryService,
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

      if (chzzkChannelDetail.liveId) {
        const channelLive =
          await this.channelLiveService.findChannelLiveByLiveId(
            chzzkChannelDetail.liveId,
          );

        if (!channelLive) {
          const generateChannelLiveDto = new GenerateChannelLiveDto();
          generateChannelLiveDto.channel = channel;
          generateChannelLiveDto.chatChannelId =
            chzzkChannelDetail.chatChannelId;
          generateChannelLiveDto.liveId = chzzkChannelDetail.liveId;
          generateChannelLiveDto.liveTitle = chzzkChannelDetail.liveTitle;
          generateChannelLiveDto.status =
            chzzkChannelDetail.status === 'OPEN' ? true : false;

          const generateChannelLiveLogDto = new GenerateChannelLiveLogDto();
          generateChannelLiveLogDto.accumulateCount =
            chzzkChannelDetail.accumulateCount;
          generateChannelLiveLogDto.concurrentUserCount =
            chzzkChannelDetail.concurrentUserCount;
          generateChannelLiveLogDto.minFollowerMinute =
            chzzkChannelDetail.minFollowerMinute;
          generateChannelLiveLogDto.liveTitle = chzzkChannelDetail.liveTitle;

          await this.channelLiveService.generateChannelLive(
            generateChannelLiveDto,
          );
        } else {
          const generateChannelLiveLogDto = new GenerateChannelLiveLogDto();
          generateChannelLiveLogDto.accumulateCount =
            chzzkChannelDetail.accumulateCount;
          generateChannelLiveLogDto.concurrentUserCount =
            chzzkChannelDetail.concurrentUserCount;
          generateChannelLiveLogDto.minFollowerMinute =
            chzzkChannelDetail.minFollowerMinute;
          generateChannelLiveLogDto.liveTitle = chzzkChannelDetail.liveTitle;
          generateChannelLiveLogDto.channelLive = channelLive;

          await this.channelLiveLogService.generateChannelLiveLog(
            generateChannelLiveLogDto,
          );
        }

        const channelLiveDto = new ChannelLiveDto();
      }
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
