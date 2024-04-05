import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChannelService } from '../services/chzzk.service';

@ApiTags('chzzk')
@Controller('chzzk')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('channels')
  async getChannelsByKeyword(@Query('keyword') keyword: string) {
    console.log('keyword =>', keyword);

    return await this.channelService.getChannelsByKeyword(keyword);
  }

  @Get('channels/:channelId')
  async getChannelById(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.channelService.getChannelById(channelId);
  }

  @Get('channels/:channelId/status')
  async getChannelStatus(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.channelService.getChannelStatus(channelId);
  }

  @Get('channels/:channelId/detail')
  async getChannelDetails(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.channelService.getChannelDetails(channelId);
  }

  @Post('join/:channelId')
  async joinChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.channelService.joinChannel(channelId);
  }

  @Post('leave/:channelId')
  async leaveChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.channelService.leaveChannel(channelId);
  }
}
