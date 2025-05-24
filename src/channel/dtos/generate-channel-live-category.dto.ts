import { PickType } from '@nestjs/swagger';
import { ChannelLiveCategoryDto } from 'src/channel/dtos/channel-live-category.dto';

export class GenerateChannelLiveCategoryDto extends PickType(
  ChannelLiveCategoryDto,
  ['categoryType', 'liveCategory', 'liveCategoryValue'],
) {}
