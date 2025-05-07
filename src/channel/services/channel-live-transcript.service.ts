import { Injectable } from '@nestjs/common';
import { ChannelLiveTranscript } from '../entities/channel-live-transcript.entity';
import { ChannelLiveTranscriptRepository } from '../repositories/channel-live-transcript.repository';

@Injectable()
export class ChannelLiveTranscriptService {
  constructor(
    private readonly channelLiveTranscriptRepository: ChannelLiveTranscriptRepository,
  ) {}

  async create(channelLiveTranscript: ChannelLiveTranscript) {
    return this.channelLiveTranscriptRepository.create(channelLiveTranscript);
  }
}
