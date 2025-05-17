import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLiveLog } from '../entities/channel-live-log.entity';
import { GenerateChannelLiveLogDto } from '../dtos/generate-channel-live-log.dto';
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
