import { PickType } from '@nestjs/swagger';
import { ChannelLiveLogDto } from 'src/channel/dtos/channel-live-log.dto';

export class GenerateChannelLiveLogDto extends PickType(ChannelLiveLogDto, [
  'liveTitle',
  'accumulateCount',
  'concurrentUserCount',
  'minFollowerMinute',
  'channelLive',
  'liveCategory',
]) {}
