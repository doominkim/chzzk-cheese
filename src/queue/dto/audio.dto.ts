import { ApiProperty } from '@nestjs/swagger';

export class AudioJobDto {
  @ApiProperty({
    description: '오디오 파일 경로',
    example: '/path/to/audio.wav',
  })
  filePath: string;

  @ApiProperty({
    description: '채널 ID',
    example: '123456',
  })
  channelId: string;

  @ApiProperty({
    description: '라이브 ID',
    example: '123456',
  })
  liveId: string;

  @ApiProperty({
    description: '시작 시간',
    example: '2024-05-05T12:00:00Z',
  })
  startTime: string;

  @ApiProperty({
    description: '종료 시간',
    example: '2024-05-05T12:01:00Z',
  })
  endTime: string;
}

export class WhisperResultDto {
  @ApiProperty({
    description: '채널 ID',
    example: '123456',
  })
  channelId: string;

  @ApiProperty({
    description: '라이브 ID',
    example: '123456',
  })
  liveId: string;

  @ApiProperty({
    description: '오디오 파일 경로',
    example: '/path/to/audio.wav',
  })
  filePath: string;

  @ApiProperty({
    description: '시작 시간',
    example: '2024-05-05T12:00:00Z',
  })
  startTime: string;

  @ApiProperty({
    description: '종료 시간',
    example: '2024-05-05T12:01:00Z',
  })
  endTime: string;

  @ApiProperty({
    description: '변환된 텍스트',
    example: '안녕하세요. 오늘은 좋은 날씨네요.',
  })
  text: string;
}
