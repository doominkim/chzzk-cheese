import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ExportChzzkService } from './export-chzzk.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('치지직 모듈연동')
@Controller('chzzk')
export class ChzzkController {
  constructor(private exportChzzkService: ExportChzzkService) {}

  @Get('channels')
  async getChannelsByKeyword(@Query('keyword') keyword: string) {
    console.log('keyword =>', keyword);

    return await this.exportChzzkService.getChannelsByKeyword(keyword);
  }

  @Get('channels/:channelId')
  async getChannelById(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.exportChzzkService.getChannelById(channelId);
  }

  @Get('channels/:channelId/status')
  async getChannelStatus(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.exportChzzkService.getChannelStatus(channelId);
  }

  @Get('channels/:channelId/detail')
  async getChannelDetails(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.exportChzzkService.getChannelDetails(channelId);
  }

  @Post('join/:channelId')
  async joinChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.exportChzzkService.joinChannel(channelId);
  }

  @Post('leave/:channelId')
  async leaveChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.exportChzzkService.leaveChannel(channelId);
  }
}
