import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ChzzkService } from './chzzk.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('치지직 모듈연동')
@Controller('chzzk')
export class ChzzkController {
  constructor(private chzzkService: ChzzkService) {}

  @Get('channel')
  async getChannelsByKeyword(@Query('keyword') keyword: string) {
    console.log('keyword =>', keyword);

    return await this.chzzkService.getChannelsByKeyword(keyword);
  }

  @Get('channel/:channelId')
  async getChannelById(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelById(channelId);
  }

  @Get('channel/:channelId/live-status')
  async getChannelLiveStatus(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelLiveStatus(channelId);
  }

  @Get('channel/:channelId/live-detail')
  async getChannelLiveDetail(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelLiveDetail(channelId);
  }

  @Post('join/:channelId')
  async joinChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.chzzkService.joinChannel(channelId);
  }

  @Post('leave/:channelId')
  async leaveChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.chzzkService.leaveChannel(channelId);
  }
}
