import { PickType } from '@nestjs/swagger';
import { ChannelLiveDto } from './channel-live.dto';

export class GenerateChannelLiveDto extends PickType(ChannelLiveDto, [
  'liveId',
  'liveTitle',
  'channel',
  'status',
  'chatChannelId',
]) {}
