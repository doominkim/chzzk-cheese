import { Injectable } from '@nestjs/common';
import { ChannelRepository } from '../repositories/channel.repository';

@Injectable()
export class ChannelService {
  constructor(private channelRepository: ChannelRepository) {}
}
