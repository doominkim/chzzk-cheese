import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLiveTranscript } from '../entities/channel-live-transcript.entity';
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
}
