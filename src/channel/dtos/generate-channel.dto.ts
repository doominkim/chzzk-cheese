import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities/channel.entity';

export class GenerateChannelDto extends PickType(Channel, [
  'channelId',
  'channelImageUrl',
  'channelName',
  'follower',
  'openLive',
  'channelLive',
]) {}
