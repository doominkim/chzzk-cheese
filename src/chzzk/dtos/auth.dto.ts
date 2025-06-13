import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TokenRequestDto {
  @ApiProperty({
    description: '인증 타입 (authorization_code 또는 refresh_token)',
    example: 'authorization_code',
  })
  @IsString()
  @IsNotEmpty()
  grantType: string;

  @ApiProperty({
    description: '클라이언트 ID',
    example: 'fefb6bbb-00c2-497c-afc2-XXXXXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: '클라이언트 시크릿',
    example: 'VeIMuc9XGle7PSxIVYNwPpI2OEk_9gXoW_XXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiProperty({
    description: '인증 코드 (grantType이 authorization_code일 때만 필요)',
    example: 'ygKEQQk3p0DjUsBjJradJmXXXXXXXX',
    required: false,
  })
  @IsString()
  code?: string;

  @ApiProperty({
    description: '상태값 (grantType이 authorization_code일 때만 필요)',
    example: 'zxclDasdfA25',
    required: false,
  })
  @IsString()
  state?: string;

  @ApiProperty({
    description: '리프레시 토큰 (grantType이 refresh_token일 때만 필요)',
    example: 'NWG05CKHAsz4k4d3PB0wQUV9ugGlp0YuibQ4XXXXXXXX',
    required: false,
  })
  @IsString()
  refreshToken?: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: '액세스 토큰',
    example: 'FFok65zQFQVcFvH2eJ7SS7SBFlTXt0EZ10L5XXXXXXXX',
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example: 'NWG05CKHAsz4k4d3PB0wQUV9ugGlp0YuibQ4XXXXXXXX',
  })
  refreshToken: string;

  @ApiProperty({
    description: '토큰 타입',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: '만료 시간(초)',
    example: '86400',
  })
  expiresIn: string;

  @ApiProperty({
    description: '스코프',
    example: '채널 조회',
    required: false,
  })
  scope?: string;
}

export class TokenRevokeRequestDto {
  @ApiProperty({
    description: '클라이언트 ID',
    example: 'fefb6bbb-00c2-497c-afc2-XXXXXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: '클라이언트 시크릿',
    example: 'VeIMuc9XGle7PSxIVYNwPpI2OEk_9gXoW_XXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiProperty({
    description: '토큰',
    example: 'motTJ-NZ-fev3cmaTMydzYk_zyw524C9ZYdNXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: '토큰 타입 힌트 (access_token 또는 refresh_token)',
    example: 'access_token',
    required: false,
  })
  @IsString()
  tokenTypeHint?: string;
}
