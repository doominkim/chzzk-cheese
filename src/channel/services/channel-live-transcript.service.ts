import { Injectable } from '@nestjs/common';
import { ChannelLiveTranscript } from '../entities/channel-live-transcript.entity';
import { ChannelLiveTranscriptRepository } from '../repositories/channel-live-transcript.repository';
import { FindChannelLiveTranscriptDto } from '../dtos/find-channel-live-transcript.dto';

@Injectable()
export class ChannelLiveTranscriptService {
  constructor(
    private readonly channelLiveTranscriptRepository: ChannelLiveTranscriptRepository,
  ) {}

  async create(channelLiveTranscript: ChannelLiveTranscript) {
    return this.channelLiveTranscriptRepository.create(channelLiveTranscript);
  }

  async find(uuid: string, findDto: FindChannelLiveTranscriptDto) {
    return await this.channelLiveTranscriptRepository.find(uuid, findDto);
  }
}
