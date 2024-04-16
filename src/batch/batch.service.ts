import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChannelLiveCategoryDto } from 'src/channel/dtos/channel-live-category.dto';
import { ChannelLiveDto } from 'src/channel/dtos/channel-live.dto';
import { ChannelDto } from 'src/channel/dtos/channel.dto';
import { FindChannelDto } from 'src/channel/dtos/find-channel.dto';
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
import { ChzzkModule } from 'chzzk-z';
import { ChannelChatLogService } from 'src/channel/services/channel-chat-log.service';
import { GenerateChannelChatLogDto } from 'src/channel/dtos/generate-channel-cat-log.dto';
@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  private readonly chzzkModules: Map<string, ChzzkModule>;

  constructor(
    private chzzkService: ChzzkService,
    private channelService: ChannelService,
    private channelLiveService: ChannelLiveService,
    private channelLiveLogService: ChannelLiveLogService,
    private channelLiveCategoryService: ChannelLiveCategoryService,
    private channelChatLogService: ChannelChatLogService,
  ) {
    this.chzzkModules = new Map<string, ChzzkModule>();
  }

  @Cron('0 */1 * * * *', {
    name: 'trackingChannelChats',
  })
  async trackingChannelChats() {
    const findChannelDto = new FindChannelDto();
    findChannelDto.openLive = true;
    findChannelDto.isChatCollected = true;
    const channels = await this.channelService.findChannels(findChannelDto);

    for (const channel of channels) {
      const { channelId } = channel;
      const chzzkModule = this.chzzkModules.get(channelId);
      if (!chzzkModule) {
        const newChzzkModule = new ChzzkModule();
        newChzzkModule.chat.join(channelId);
        this.chzzkModules.set(channelId, newChzzkModule);

        setInterval(() => {
          const events = newChzzkModule.chat.pollingEvent();
          for (const event of events) {
            const generateChannelChatLogDto = new GenerateChannelChatLogDto();
            generateChannelChatLogDto.chatType = event.type;
            generateChannelChatLogDto.message = event.msg;
            generateChannelChatLogDto.chatChannelId = event.cid;
            generateChannelChatLogDto.userIdHash = event.uid;
            generateChannelChatLogDto.channel = channel;
            if (event?.profile) {
              generateChannelChatLogDto.nickname = event?.profile.nickname;
            }

            generateChannelChatLogDto.profile = event?.profile;
            generateChannelChatLogDto.extras = event?.extras;

            this.channelChatLogService.generateChannelChatLog(
              generateChannelChatLogDto,
            );
          }
        }, 1000);
      }
    }
  }

  @Cron('0 */1 * * * *', {
    name: 'trackingChannels',
  })
  async trackingChannels() {
    try {
      const findChannelDto = new FindChannelDto();
      findChannelDto.openLive = true;
      const channels = await this.channelService.findChannels(findChannelDto);

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
    try {
      if (
        !chzzkChannelDetail.categoryType ||
        !chzzkChannelDetail.liveCategory
      ) {
        throw new Error('선택된 카테고리가 없습니다.');
      }

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
    } catch (e) {
      this.logger.error(e);
    }
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
