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

    const total = await query.getCount();

    query.orderBy('clt.createdAt', 'DESC');

    if (findDto.offset) {
      query.skip(findDto.offset);
    }

    query.take(findDto.limit || 20);

    const items = await query.getMany();

    const sortedItems = items.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return {
      items: sortedItems,
      total,
      hasMore: (findDto.offset || 0) + (findDto.limit || 20) < total,
    };
  }
}
