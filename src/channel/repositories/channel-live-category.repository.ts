import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelLiveCategory } from '../entities/channel-live-category.entity';
import { GenerateChannelLiveCategoryDto } from '../dtos/generate-channel-live-category.dto';

@Injectable()
export class ChannelLiveCategoryRepository {
  constructor(
    @InjectRepository(ChannelLiveCategory)
    private repository: Repository<ChannelLiveCategory>,
  ) {}

  async findChannelLiveCategoryByLiveId(
    categoryType: string,
    liveCategory: string,
  ): Promise<ChannelLiveCategory> {
    return await this.repository
      .createQueryBuilder('clc')
      .where('clc.categoryType = :categoryType', { categoryType })
      .andWhere('clc.liveCategory = :liveCategory', { liveCategory })
      .getOne();
  }

  async generateChannelLiveCategory(
    generateChannelLiveCategoryDto: GenerateChannelLiveCategoryDto,
  ) {
    const instance = this.repository.create({
      ...generateChannelLiveCategoryDto,
    });

    return await this.repository.save(instance);
  }
}
