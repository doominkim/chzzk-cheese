import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetDonationRankDto {
  @Type(() => Date)
  @ApiProperty({
    required: false,
    type: Date,
    example: new Date(),
  })
  @IsDate()
  fromCreatedAt: Date;

  @Type(() => Date)
  @ApiProperty({
    required: false,
    type: Date,
    example: new Date(),
  })
  @IsDate()
  toCreatedAt: Date;

  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  uuid: string;

  @Type(() => Number)
  @ApiProperty({
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  limit: number;
}
