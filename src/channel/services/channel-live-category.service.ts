import { Injectable, Logger } from '@nestjs/common';
import { ChannelLiveCategoryRepository } from '../repositories/channel-live-category.repository';
import { GenerateChannelLiveCategoryDto } from '../dtos/generate-channel-live-category.dto';
import { ChannelLiveCategory } from '../entities/channel-live-category.entity';

@Injectable()
export class ChannelLiveCategoryService {
  private logger = new Logger(ChannelLiveCategoryService.name);

  constructor(
    private channelLiveCategoryRepository: ChannelLiveCategoryRepository,
  ) {}

  async findChannelLiveCategory(
    categoryType: string,
    liveCategory: string,
  ): Promise<ChannelLiveCategory> {
    return await this.channelLiveCategoryRepository.findChannelLiveCategory(
      categoryType,
      liveCategory,
    );
  }
  async generateChannelLiveCategory(
    generateChannelLiveCategoryDto: GenerateChannelLiveCategoryDto,
  ): Promise<ChannelLiveCategory> {
    return await this.channelLiveCategoryRepository.generateChannelLiveCategory(
      generateChannelLiveCategoryDto,
    );
  }
}
