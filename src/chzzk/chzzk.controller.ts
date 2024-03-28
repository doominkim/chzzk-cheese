import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChzzkService } from './chzzk.service';

@Controller('chzzk')
export class ChzzkController {
  constructor(private chzzkService: ChzzkService) {}

  @Get('channels/')
  async getChannelsByKeyword(@Query('keyword') keyword: string) {
    console.log('keyword =>', keyword);

    return await this.chzzkService.getChannelsByKeyword(keyword);
  }

  @Get('channels/:channelId')
  async getChannelById(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelById(channelId);
  }
}
