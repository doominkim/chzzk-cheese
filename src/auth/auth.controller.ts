import { Controller, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { NaverMeDto } from './dtos/me.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiProperty({
    description: '네이버 로그인',
  })
  @Post('login/naver')
  async loginNaver(
    @Query('accessToken') accessToken: string,
  ): Promise<NaverMeDto> {
    return await this.authService.loginNaver(accessToken);
  }
}
