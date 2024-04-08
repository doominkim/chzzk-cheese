import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLiveLogDto } from '../dtos/channel-live-log.dto';
import { GenerateChannelLiveLogDto } from '../dtos/channel-live-log.dto copy';
import { ChannelLiveLog } from '../entities/channel-live-log.entity';
@Injectable()
export class ChannelLiveLogLogRepository {
  constructor(
    @InjectRepository(ChannelLiveLog)
    private repository: Repository<ChannelLiveLog>,
  ) {}

  // async findChannelLiveLogByLiveId(liveId: number): Promise<ChannelLiveLogDto> {
  //   return await this.repository
  //     .createQueryBuilder('cll')
  //     .where('cll.liveId = :liveId', { liveId })
  //     .getOne();
  // }

  async generateChannelLiveLog(
    generateChannelLiveLogDto: GenerateChannelLiveLogDto,
  ) {
    const instance = this.repository.create({
      ...generateChannelLiveLogDto,
    });

    return await this.repository.save(instance);
  }
}
