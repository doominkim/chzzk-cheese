import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { ChannelService } from '../services/channel.service';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';

@ApiTags('채널 관리')
@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @ApiProperty({
    description: '채널 전체 조회',
  })
  @Get()
  async findChannels() {
    return this.channelService.findChannels();
  }

  @ApiProperty({
    description: '채널 조회',
  })
  @Get(':id')
  async findChannel(@Param('id') id: string) {
    return this.channelService.findChannelByChannelId(id);
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
  @Get(':id/recentActivity')
  async getRecentActivity(@Param('id') id: string) {
    return this.channelService.getRecentActivity(id);
  }

  @ApiProperty({
    description: '방송시간 캘린더',
  })
  @Get(':id/calendar')
  async getCalendar(@Param('id') id: string) {
    return this.channelService.getCalendar(id);
  }

  @ApiProperty({
    description: '종합방송 카테고리 순위',
  })
  @Get(':id/liveCategoryRank')
  async getLiveCategoryRankById(@Param('id') id: string) {
    return this.channelService.getLiveCategoryRankById(id);
  }
}
