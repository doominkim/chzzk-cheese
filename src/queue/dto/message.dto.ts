import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: '메시지 내용',
    example: 'Hello World',
  })
  message: string;

  @ApiProperty({
    description: '메시지 타임스탬프',
    example: '2024-05-05T12:00:00Z',
    required: false,
  })
  timestamp?: string;

  @ApiProperty({
    description: '메시지 우선순위',
    example: 1,
    required: false,
  })
  priority?: number;
}

export class BulkMessageDto {
  @ApiProperty({
    description: '메시지 배열',
    type: [MessageDto],
    example: [
      { message: 'Hello 1', timestamp: '2024-05-05T12:00:00Z' },
      { message: 'Hello 2', timestamp: '2024-05-05T12:01:00Z' },
    ],
  })
  messages: MessageDto[];
}
