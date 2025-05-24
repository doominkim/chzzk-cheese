import { PickType } from '@nestjs/swagger';
import { ChannelLiveDto } from 'src/channel/dtos/channel-live.dto';

export class GenerateChannelLiveDto extends PickType(ChannelLiveDto, [
  'liveId',
  'liveTitle',
  'channel',
  'status',
  'chatChannelId',
  'liveLog',
  'liveCategory',
]) {}
