import { Repository } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { Injectable } from '@nestjs/common';
import { ChannelDto } from '../dtos/channel.dto';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';

@Injectable()
export class ChannelRepository extends Repository<Channel> {
  async findChannels() {
    return await this.createQueryBuilder('channel').getMany();
  }

  async findChannelById(id: number) {
    return await this.createQueryBuilder('channel')
      .where('channel.id = :id', { id })
      .getOne();
  }

  async findChannelByChannelId(channelId: string) {
    return await this.createQueryBuilder('channel')
      .where('channel.channelId = :channelId', { channelId })
      .getOne();
  }

  async generateChannel(generateChannelDto: GenerateChannelDto) {
    const instance = this.create({
      ...generateChannelDto,
    });

    return await this.save(instance);
  }

  async modifyChannel(id: number, modifyChannelDto: GenerateChannelDto) {
    return await this.update(id, modifyChannelDto);
  }
}
