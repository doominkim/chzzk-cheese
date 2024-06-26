import { Repository, UpdateEvent, UpdateResult } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLive } from '../entities/channel-live.entity';
import { GenerateChannelLiveDto } from '../dtos/generate-channel-live.dto';
import { ChannelLiveDto } from '../dtos/channel-live.dto';
import { ModifyChannelLiveDto } from '../dtos/modify-channel-live.dto';

@Injectable()
export class ChannelLiveRepository {
  constructor(
    @InjectRepository(ChannelLive)
    private repository: Repository<ChannelLive>,
  ) {}

  async findChannelLiveByLiveId(liveId: number): Promise<ChannelLiveDto> {
    return await this.repository
      .createQueryBuilder('cl')
      .where('cl.liveId = :liveId', { liveId })
      .getOne();
  }

  async generateChannelLive(
    generateChannelLiveDto: GenerateChannelLiveDto,
  ): Promise<ChannelLiveDto> {
    const instance = this.repository.create({
      ...generateChannelLiveDto,
    });

    return await this.repository.save(instance);
  }

  async modifyChannelLive(
    id: number,
    modifyChannelLiveDto: ModifyChannelLiveDto,
  ): Promise<UpdateResult> {
    return await this.repository.update(id, modifyChannelLiveDto);
  }
}
