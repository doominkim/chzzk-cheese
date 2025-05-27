import { Controller, Get, Query } from '@nestjs/common';
import { ChannelChatLogService } from '../services/channel-chat-log.service';
import { FindChatDto } from '../dtos/find-chat.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('채팅 관리')
@Controller('chat')
export class ChatController {
  constructor(private readonly channelChatLogService: ChannelChatLogService) {}

  @Get()
  async getChats(@Query() findChatDto: FindChatDto) {
    return await this.channelChatLogService.findChatsV2(findChatDto);
  }
}
