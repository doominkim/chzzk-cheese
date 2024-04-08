import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLive } from '../entities/channel-live.entity';
import { GenerateChannelLiveDto } from '../dtos/generate-channel-live.dto';

@Injectable()
export class ChannelLiveRepository {
  constructor(
    @InjectRepository(ChannelLive)
    private repository: Repository<ChannelLive>,
  ) {}

  async findChannelLiveByLiveId(liveId: number): Promise<ChannelLive> {
    return await this.repository
      .createQueryBuilder('cl')
      .where('cl.liveId = :liveId', { liveId })
      .getOne();
  }

  async generateChannelLive(generateChannelLiveDto: GenerateChannelLiveDto) {
    const instance = this.repository.create({
      ...generateChannelLiveDto,
    });

    return await this.repository.save(instance);
  }
}
