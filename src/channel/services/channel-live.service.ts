import { Injectable, Logger } from '@nestjs/common';
import { ChannelLiveRepository } from '../repositories/channel-live.repository';
import { GenerateChannelLiveDto } from '../dtos/generate-channel-live.dto';
import { ModifyChannelLiveDto } from '../dtos/modify-channel-live.dto';

@Injectable()
export class ChannelLiveService {
  private logger = new Logger(ChannelLiveService.name);

  constructor(private channelLiveRepository: ChannelLiveRepository) {}

  async findChannelLiveByLiveId(liveId: number) {
    return await this.channelLiveRepository.findChannelLiveByLiveId(liveId);
  }

  async generateChannelLive(generateChannelLiveDto: GenerateChannelLiveDto) {
    return await this.channelLiveRepository.generateChannelLive(
      generateChannelLiveDto,
    );
  }

  async modifyChannelLive(
    id: number,
    modifyChannelLiveDto: ModifyChannelLiveDto,
  ) {
    return await this.channelLiveRepository.modifyChannelLive(
      id,
      modifyChannelLiveDto,
    );
  }
}
