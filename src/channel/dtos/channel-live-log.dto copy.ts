import { PickType } from '@nestjs/swagger';
import { ChannelLiveLogDto } from './channel-live-log.dto';

export class GenerateChannelLiveLogDto extends PickType(ChannelLiveLogDto, [
  'accumulateCount',
  'concurrentUserCount',
  'liveTitle',
  'minFollowerMinute',
]) {}
