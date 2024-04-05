import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  async getChannels() {
    return await this.createQueryBuilder('channel').getMany();
  }
}
