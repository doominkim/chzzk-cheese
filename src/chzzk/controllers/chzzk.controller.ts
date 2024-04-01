import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChzzkService } from '../services/chzzk.service';

@Controller('chzzk')
export class ChzzkController {
  constructor(private chzzkService: ChzzkService) {}

  @Get('channels')
  async getChannelsByKeyword(@Query('keyword') keyword: string) {
    console.log('keyword =>', keyword);

    return await this.chzzkService.getChannelsByKeyword(keyword);
  }

  @Get('channels/:channelId')
  async getChannelById(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelById(channelId);
  }

  @Get('channels/:channelId/status')
  async getChannelStatus(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelStatus(channelId);
  }

  @Get('channels/:channelId/detail')
  async getChannelDetails(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelDetails(channelId);
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
