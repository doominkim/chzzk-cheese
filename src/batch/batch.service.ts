import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChannelLiveCategoryDto } from 'src/channel/dtos/channel-live-category.dto';
import { ChannelLiveDto } from 'src/channel/dtos/channel-live.dto';
import { ChannelDto } from 'src/channel/dtos/channel.dto';
import { GenerateChannelLiveCategoryDto } from 'src/channel/dtos/generate-channel-live-category.dto';
import { GenerateChannelLiveLogDto } from 'src/channel/dtos/generate-channel-live-log.dto';
import { GenerateChannelLiveDto } from 'src/channel/dtos/generate-channel-live.dto';
import { ModifyChannelLiveDto } from 'src/channel/dtos/modify-channel-live.dto';
import { ModifyChannelDto } from 'src/channel/dtos/modify-channel.dto';
import { ChannelLiveCategory } from 'src/channel/entities/channel-live-category.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { ChannelLiveCategoryService } from 'src/channel/services/channel-live-category.service';
import { ChannelLiveLogService } from 'src/channel/services/channel-live-log.service';
import { ChannelLiveService } from 'src/channel/services/channel-live.service';
import { ChannelService } from 'src/channel/services/channel.service';
import { ChzzkService } from 'src/chzzk/chzzk.service';
import { ChzzkChannelDetailDto } from 'src/chzzk/dtos/chzzk-channel-live-detail.dto';
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

  @Cron('0 */1 * * * *', {
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

      const channelLiveCategory = await this.findOrGenerateChannelLiveCategory(
        chzzkChannelDetail,
      );

      if (chzzkChannelDetail.liveId) {
        await this.upsertChannelLive(
          channel,
          chzzkChannelDetail,
          channelLiveCategory,
        );
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
  async findOrGenerateChannelLiveCategory(
    chzzkChannelDetail: ChzzkChannelDetailDto,
  ): Promise<ChannelLiveCategory> {
    let channelLiveCategory: ChannelLiveCategory;
    channelLiveCategory =
      await this.channelLiveCategoryService.findChannelLiveCategory(
        chzzkChannelDetail.categoryType,
        chzzkChannelDetail.liveCategory,
      );

    if (!channelLiveCategory) {
      const generateChannelLiveCategoryDto =
        new GenerateChannelLiveCategoryDto();

      generateChannelLiveCategoryDto.categoryType =
        chzzkChannelDetail.categoryType;
      generateChannelLiveCategoryDto.liveCategory =
        chzzkChannelDetail.liveCategory;
      generateChannelLiveCategoryDto.liveCategoryValue =
        chzzkChannelDetail.liveCategoryValue;

      channelLiveCategory =
        await this.channelLiveCategoryService.generateChannelLiveCategory(
          generateChannelLiveCategoryDto,
        );
    }

    return channelLiveCategory;
  }
  async upsertChannelLive(
    channel: ChannelDto,
    chzzkChannelDetail: ChzzkChannelDetailDto,
    channelLiveCategory: ChannelLiveCategoryDto,
  ) {
    const channelLive = await this.channelLiveService.findChannelLiveByLiveId(
      chzzkChannelDetail.liveId,
    );

    if (!channelLive) {
      const generateChannelLiveDto = new GenerateChannelLiveDto();
      generateChannelLiveDto.channel = channel;
      generateChannelLiveDto.chatChannelId = chzzkChannelDetail.chatChannelId;
      generateChannelLiveDto.liveId = chzzkChannelDetail.liveId;
      generateChannelLiveDto.liveTitle = chzzkChannelDetail.liveTitle;
      generateChannelLiveDto.status =
        chzzkChannelDetail.status === 'OPEN' ? true : false;
      generateChannelLiveDto.liveCategory = channelLiveCategory;

      await this.channelLiveService.generateChannelLive(generateChannelLiveDto);
    } else {
      const modifyChannelLiveDto = new ModifyChannelLiveDto();
      modifyChannelLiveDto.chatChannelId = chzzkChannelDetail.chatChannelId;
      modifyChannelLiveDto.liveTitle = chzzkChannelDetail.liveTitle;
      modifyChannelLiveDto.status =
        chzzkChannelDetail.status === 'OPEN' ? true : false;
      modifyChannelLiveDto.liveCategory = channelLiveCategory;

      await this.channelLiveService.modifyChannelLive(
        channelLive.id,
        modifyChannelLiveDto,
      );
    }

    await this.generateChannelLiveLog(
      chzzkChannelDetail,
      channelLive,
      channelLiveCategory,
    );
  }
  async generateChannelLiveLog(
    chzzkChannelDetail: ChzzkChannelDetailDto,
    channelLive: ChannelLiveDto,
    channelLiveCategory: ChannelLiveCategoryDto,
  ) {
    const generateChannelLiveLogDto = new GenerateChannelLiveLogDto();
    generateChannelLiveLogDto.accumulateCount =
      chzzkChannelDetail.accumulateCount;
    generateChannelLiveLogDto.concurrentUserCount =
      chzzkChannelDetail.concurrentUserCount;
    generateChannelLiveLogDto.minFollowerMinute =
      chzzkChannelDetail.minFollowerMinute;
    generateChannelLiveLogDto.liveTitle = chzzkChannelDetail.liveTitle;
    generateChannelLiveLogDto.channelLive = channelLive;
    generateChannelLiveLogDto.liveCategory = channelLiveCategory;

    await this.channelLiveLogService.generateChannelLiveLog(
      generateChannelLiveLogDto,
    );
  }
}
