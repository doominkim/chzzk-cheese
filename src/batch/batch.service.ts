import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
import { DataSource } from 'typeorm';
import { StreamService } from 'src/stream/stream.service';
import { DatabasePartitionInitializer } from 'src/common/bootstrap/partition-initializer';
import { QueueService } from 'src/queue/queue.service';
import { BatchOnly } from 'src/common/decorators/batch-only.decorator';
@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);
  private readonly chzzkModules: Map<string, ChzzkModule>;
  private readonly MAX_MODULES = 100; // 최대 모듈 수 제한

  constructor(
    private chzzkService: ChzzkService,
    private channelService: ChannelService,
    private channelLiveService: ChannelLiveService,
    private channelLiveLogService: ChannelLiveLogService,
    private channelLiveCategoryService: ChannelLiveCategoryService,
    private channelChatLogService: ChannelChatLogService,
    private dataSource: DataSource,
    private streamService: StreamService,
    private partitionInitializer: DatabasePartitionInitializer,
    private queueService: QueueService,
  ) {
    this.chzzkModules = new Map<string, ChzzkModule>();
  }

  // Map 크기 관리 메서드
  private manageModulesSize() {
    if (this.chzzkModules.size > this.MAX_MODULES) {
      const keysToDelete = Array.from(this.chzzkModules.keys()).slice(0, 10);
      keysToDelete.forEach((key) => {
        this.chzzkModules.delete(key);
      });
      this.logger.debug(`Cleaned up ${keysToDelete.length} old modules`);

      // 강제 가비지 컬렉션
      if (global.gc) {
        global.gc();
      }
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: 'trackingChannelChats',
  })
  @BatchOnly()
  async trackingChannelChats() {
    if (!process.env.IS_BATCH) return;

    // 주기적으로 Map 크기 관리
    this.manageModulesSize();

    const findChannelDto = new FindChannelDto();
    findChannelDto.openLive = true;
    findChannelDto.isChatCollected = true;
    const channels = await this.channelService.findChannels(findChannelDto);

    for (const channel of channels) {
      const { uuid } = channel;
      const chzzkModule = this.chzzkModules.get(uuid);
      if (!chzzkModule) {
        const newChzzkModule = new ChzzkModule();
        newChzzkModule.chat.join(uuid);
        this.chzzkModules.set(uuid, newChzzkModule);

        try {
          setInterval(() => {
            const events = newChzzkModule.chat.pollingEvent();
            this.dataSource.transaction(async (manager) => {
              const generateChannelChatLogDtos: GenerateChannelChatLogDto[] =
                [];
              for (const event of events) {
                const generateChannelChatLogDto =
                  new GenerateChannelChatLogDto();
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

                generateChannelChatLogDtos.push(generateChannelChatLogDto);
              }
              this.channelChatLogService.generateChannelChatLogs(
                generateChannelChatLogDtos,
                manager,
              );
            });
          }, 5000);
        } catch (e) {
          this.logger.error(e);
          // 에러가 나는 경우 배치 Map에서 delete
          this.chzzkModules.delete(uuid);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'trackingChannelAudioAndImage',
  })
  @BatchOnly()
  async trackingChannelAudioAndImage() {
    if (!process.env.IS_BATCH) return;

    const findChannelDto = new FindChannelDto();
    findChannelDto.openLive = true;
    findChannelDto.isChatCollected = true;
    const channels = await this.channelService.findChannels(findChannelDto);

    for (const channel of channels) {
      const { uuid } = channel;
      await this.streamService.startRecording(uuid);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'trackingChannels',
  })
  @BatchOnly()
  async trackingChannels() {
    if (!process.env.IS_BATCH) return;

    try {
      const findChannelDto = new FindChannelDto();
      const channels = await this.channelService.findChannelsForBatch(
        findChannelDto,
      );

      for (const channel of channels) {
        await this.trackingChannel(channel);
      }

      this.logger.log(`[${this.trackingChannels.name}]`);
    } catch (e) {
      this.logger.error(e);
    }
  }
  async trackingChannel(channel: Channel) {
    const { id, uuid } = channel;

    const chzzkChannel = await this.chzzkService.getChannelById(uuid);

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
        uuid,
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

  @Cron('0 0 25 * *', {
    name: 'prepareNextMonthPartitions',
  })
  async prepareNextMonthPartitions() {
    await this.partitionInitializer.onModuleInit();
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'cleanOldJobs',
  })
  @BatchOnly()
  async cleanOldJobs() {
    await this.queueService.cleanJobs('audio-processing');
  }

  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: 'checkWhisperWorkerHealth',
  })
  async checkWhisperWorkerHealth() {
    await this.queueService.addHealthCheckTarget();
  }
}
