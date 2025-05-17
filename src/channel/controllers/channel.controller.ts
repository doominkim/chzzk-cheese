import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { ChannelService } from '../services/channel.service';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';
import { FindChannelDto } from '../dtos/find-channel.dto';
import { GetDonationRankDto } from '../dtos/get-donation-rank.dto';
import { GetDonationDto } from '../dtos/get-donation.dto';
import { GetActiveUserRankDto } from '../dtos/get-most-active-user-rank.dto';
import { ChannelChatLogService } from '../services/channel-chat-log.service';
import { ChannelLiveTranscriptService } from '../services/channel-live-transcript.service';
import { FindChannelLiveTranscriptDto } from '../dtos/find-channel-live-transcript.dto';

@ApiTags('채널 관리')
@Controller('channel')
export class ChannelController {
  constructor(
    private channelService: ChannelService,
    private channelChatLogService: ChannelChatLogService,
    private channelLiveTranscriptService: ChannelLiveTranscriptService,
  ) {}

  @ApiProperty({
    description: '채널 전체 조회',
  })
  @Get()
  async findChannels(@Query() findChannelDto: FindChannelDto) {
    return this.channelService.findChannels(findChannelDto);
  }

  @ApiProperty({
    description: '채널 조회',
  })
  @Get(':uuid')
  async findChannelByUUID(@Param('uuid') uuid: string) {
    return this.channelService.findChannelByUUID(uuid);
  }

  @ApiProperty({
    description: '채널 등록',
  })
  @Post()
  async generateChannel(@Query() generateChannelDto: GenerateChannelDto) {
    return this.channelService.generateChannel(generateChannelDto);
  }

  @ApiProperty({
    description: '최근 방송활동내역 조회',
  })
  @Get(':uuid/recentActivity')
  async getRecentActivity(@Param('uuid') uuid: string) {
    return this.channelService.getRecentActivity(uuid);
  }

  @ApiProperty({
    description: '방송시간 캘린더',
  })
  @Get(':uuid/calendar')
  async getCalendar(@Param('uuid') uuid: string) {
    return this.channelService.getCalendar(uuid);
  }

  @ApiProperty({
    description: '종합방송 카테고리 순위',
  })
  @Get(':uuid/liveCategoryRank')
  async getLiveCategoryRankById(@Param('uuid') uuid: string) {
    return this.channelService.getLiveCategoryRankById(uuid);
  }

  @ApiProperty({
    description: '총 후원랭킹',
  })
  @Get('dashboard/donationRank')
  async getDonationRank(@Query() getDonationRankDto: GetDonationRankDto) {
    console.log(getDonationRankDto);
    return await this.channelChatLogService.getDonationRank(getDonationRankDto);
  }

  @ApiProperty({
    description: '후원 모아보기',
  })
  @Get('dashboard/donations')
  async getDonations(@Query() getDonationDto: GetDonationDto) {
    return await this.channelChatLogService.getDonations(getDonationDto);
  }

  @ApiProperty({
    description: '유저 활동랭킹',
  })
  @Get('dashboard/userRank')
  async getActiveUserRank(@Query() getActiveUserRank: GetActiveUserRankDto) {
    return await this.channelChatLogService.getActiveUserRank(
      getActiveUserRank,
    );
  }

  @Get(':uuid/transcript')
  @ApiProperty({
    description: '채널 트랜스크립트 조회',
  })
  async getTranscripts(
    @Param('uuid') uuid: string,
    @Query() findDto: FindChannelLiveTranscriptDto,
  ) {
    return await this.channelLiveTranscriptService.find(uuid, findDto);
  }
}
