import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GenerateChannelLiveLogDto } from '../dtos/channel-live-log.dto copy';
import { ChannelLiveLog } from '../entities/channel-live-log.entity';
@Injectable()
export class ChannelLiveLogRepository {
  constructor(
    @InjectRepository(ChannelLiveLog)
    private repository: Repository<ChannelLiveLog>,
  ) {}

  async generateChannelLiveLog(
    generateChannelLiveLogDto: GenerateChannelLiveLogDto,
  ) {
    const instance = this.repository.create({
      ...generateChannelLiveLogDto,
    });

    return await this.repository.save(instance);
  }
}
