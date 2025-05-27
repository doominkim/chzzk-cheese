import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ChatType } from './find-channel-chat.dto';

export class FindChatDto {
  @ApiProperty({
    description: '채널 UUID',
    required: true,
  })
  @IsString()
  uuid: string;

  @ApiProperty({
    description: '채널 채팅 채널 ID',
    required: true,
  })
  @IsString()
  chatChannelId: string;

  @ApiProperty({
    description: '페이지 크기',
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: '시작 시간',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from?: Date;

  @ApiProperty({
    description: '종료 시간',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to?: Date;

  @ApiProperty({
    description: '메시지 내용 검색',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: '사용자 ID 해시',
    required: false,
  })
  @IsOptional()
  @IsString()
  userIdHash?: string;

  @ApiProperty({
    description: '닉네임 검색',
    required: false,
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    description: '채팅 타입',
    required: false,
    enum: ChatType,
  })
  @IsOptional()
  @IsEnum(ChatType)
  chatType?: ChatType;
}
