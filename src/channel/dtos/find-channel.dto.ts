import { PickType } from '@nestjs/swagger';
import { ChannelDto } from './channel.dto';

export class FindChannelDto extends PickType(ChannelDto, [
  'channelName',
  'openLive',
  'isChatCollected',
]) {}
