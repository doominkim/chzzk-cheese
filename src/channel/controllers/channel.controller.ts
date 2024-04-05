import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExportChzzkService } from 'src/chzzk/export-chzzk.service';
import { ChannelService } from '../services/channel.service';

@ApiTags('채널 관리')
@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}
}
