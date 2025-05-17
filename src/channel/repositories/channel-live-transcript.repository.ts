import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLiveTranscript } from '../entities/channel-live-transcript.entity';
import {
  FindChannelLiveTranscriptDto,
  SortOrder,
} from '../dtos/find-channel-live-transcript.dto';

@Injectable()
export class ChannelLiveTranscriptRepository {
  constructor(
    @InjectRepository(ChannelLiveTranscript)
    private repository: Repository<ChannelLiveTranscript>,
  ) {}

  async create(channelLiveTranscript: ChannelLiveTranscript) {
    const instance = this.repository.create({
      ...channelLiveTranscript,
    });

    return await this.repository.save(instance);
  }

  async find(uuid: string, findDto: FindChannelLiveTranscriptDto) {
    const query = this.repository.createQueryBuilder('clt');

    if (uuid) {
      query.andWhere('clt.channelId = :uuid', {
        uuid,
      });
    }

    if (findDto.liveId) {
      query.andWhere('clt.liveId = :liveId', {
        liveId: findDto.liveId,
      });
    }

    if (findDto.limit) {
      query.take(findDto.limit);
    }

    query.orderBy('clt.createdAt', findDto.sort || SortOrder.DESC);

    return await query.getMany();
  }
}
