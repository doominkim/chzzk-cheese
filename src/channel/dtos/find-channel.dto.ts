import { PickType } from '@nestjs/swagger';
import { ChannelDto } from 'src/channel/dtos/channel.dto';

export class FindChannelDto extends PickType(ChannelDto, [
  'channelName',
  'openLive',
  'isChatCollected',
]) {}
