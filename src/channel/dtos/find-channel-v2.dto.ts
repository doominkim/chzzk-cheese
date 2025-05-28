import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ChannelDto } from 'src/channel/dtos/channel.dto';

export enum ChannelSortField {
  FOLLOWER = 'follower',
  OPEN_LIVE = 'openLive',
  CHAT_CREATED_AT = 'chatCreatedAt',
}

export enum ChannelSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindChannelDtoV2 extends PickType(ChannelDto, [
  'channelName',
  'openLive',
  'isChatCollected',
]) {
  @ApiProperty({
    description: '채널 UUID',
    required: false,
  })
  @IsOptional()
  @IsString()
  uuid?: string;

  @ApiProperty({
    description: '닉네임',
    required: false,
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    description: '사용자 ID 해시',
    required: false,
  })
  @IsOptional()
  @IsString()
  userIdHash?: string;

  @ApiProperty({
    description: '정렬 기준 필드',
    enum: ChannelSortField,
    required: false,
    default: ChannelSortField.FOLLOWER,
  })
  @IsOptional()
  @IsEnum(ChannelSortField)
  sortBy?: ChannelSortField = ChannelSortField.FOLLOWER;

  @ApiProperty({
    description: '정렬 순서',
    enum: ChannelSortOrder,
    required: false,
    default: ChannelSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(ChannelSortOrder)
  sortOrder?: ChannelSortOrder = ChannelSortOrder.DESC;
}
