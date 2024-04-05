import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ChannelService } from '../services/channel.service';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';

@ApiTags('채널 관리')
@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @ApiProperty({
    description: '채널 조회',
  })
  @Get()
  async findChannels() {
    return this.channelService.findChannels();
  }

  @ApiProperty({
    description: '채널 등록',
  })
  @Post()
  async generateChannel(@Query() generateChannelDto: GenerateChannelDto) {
    return this.channelService.generateChannel(generateChannelDto);
  }
}
