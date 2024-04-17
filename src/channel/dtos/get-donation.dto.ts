import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetDonationDto {
  @ApiProperty({
    required: false,
    type: String,
  })
  @IsString()
  channelId?: string;
}
