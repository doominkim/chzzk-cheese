import { Injectable, Logger } from '@nestjs/common';
import { ChannelLiveCategoryRepository } from '../repositories/channel-live-category.repository';
import { GenerateChannelLiveCategoryDto } from '../dtos/generate-channel-live-category.dto';

@Injectable()
export class ChannelLiveCategoryService {
  private logger = new Logger(ChannelLiveCategoryService.name);

  constructor(
    private channelLiveCategoryRepository: ChannelLiveCategoryRepository,
  ) {}

  async findChannelLiveCategoryByLiveId(
    categoryType: string,
    liveCategory: string,
  ) {
    return await this.channelLiveCategoryRepository.findChannelLiveCategoryByLiveId(
      categoryType,
      liveCategory,
    );
  }
  async generateChannelLiveCategory(
    generateChannelLiveCategoryDto: GenerateChannelLiveCategoryDto,
  ) {
    return await this.channelLiveCategoryRepository.generateChannelLiveCategory(
      generateChannelLiveCategoryDto,
    );
  }
}
