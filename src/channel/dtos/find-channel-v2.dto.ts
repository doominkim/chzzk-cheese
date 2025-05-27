import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';
import { ChannelDto } from 'src/channel/dtos/channel.dto';

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
}
