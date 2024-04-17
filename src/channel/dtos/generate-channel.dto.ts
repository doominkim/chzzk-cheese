import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities/channel.entity';

export class GenerateChannelDto extends PickType(Channel, [
  'uuid',
  'channelImageUrl',
  'channelDescription',
  'channelName',
  'follower',
  'openLive',
  'channelLive',
]) {}
