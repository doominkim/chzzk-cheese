import { Repository, UpdateResult } from 'typeorm';
import { Channel } from '../entities/channel.entity';
import { Injectable } from '@nestjs/common';
import { GenerateChannelDto } from '../dtos/generate-channel.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChannelRepository {
  constructor(
    @InjectRepository(Channel)
    private repository: Repository<Channel>,
  ) {}

  async findChannels(): Promise<Channel[]> {
    return await this.repository.createQueryBuilder('channel').getMany();
  }

  async findChannelById(id: number): Promise<Channel> {
    return await this.repository
      .createQueryBuilder('channel')
      .where('channel.id = :id', { id })
      .getOne();
  }

  async findChannelByChannelId(channelId: string): Promise<Channel> {
    return await this.repository
      .createQueryBuilder('channel')
      .where('channel.channelId = :channelId', { channelId })
      .getOne();
  }

  async generateChannel(
    generateChannelDto: GenerateChannelDto,
  ): Promise<Channel> {
    const instance = this.repository.create({
      ...generateChannelDto,
    });

    return await this.repository.save(instance);
  }

  async modifyChannel(
    id: number,
    modifyChannelDto: GenerateChannelDto,
  ): Promise<UpdateResult> {
    return await this.repository.update(id, modifyChannelDto);
  }
}
