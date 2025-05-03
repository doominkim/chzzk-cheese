import { IsString, IsOptional } from 'class-validator';

export class WhisperTranscribeDto {
  @IsString()
  audioUrl: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
