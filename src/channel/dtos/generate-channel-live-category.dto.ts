import { PickType } from '@nestjs/swagger';
import { ChannelLiveCategoryDto } from './channel-live-category.dto';

export class GenerateChannelLiveCategoryDto extends PickType(
  ChannelLiveCategoryDto,
  ['categoryType', 'liveCategory', 'liveCategoryValue'],
) {}
