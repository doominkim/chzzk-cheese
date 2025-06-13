import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { NaverMeDto } from './dtos/me.dto';
import { Response } from 'express';
import { ChzzkService } from 'src/chzzk/chzzk.service';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private chzzkService: ChzzkService,
  ) {}

  @ApiProperty({
    description: '네이버 로그인',
  })
  @Post('login/naver')
  async loginNaver(
    @Query('accessToken') accessToken: string,
  ): Promise<NaverMeDto> {
    return await this.authService.loginNaver(accessToken);
  }

  @Get('chzzk/callback')
  async chzzkCallback(@Req() req: Request, @Res() res: Response): Promise<any> {
    const code = req['query']['code'];
    const state = req['query']['state'];

    const token = await this.chzzkService.getToken({
      grantType: 'authorization_code',
      clientId: process.env.CHZZK_CLIENT_ID,
      clientSecret: process.env.CHZZK_CLIENT_SECRET,
      code,
      state,
    });

    if (!token) {
      return res.redirect('https://ping-pong.world/login/error');
    }

    const sessionId = this.authService.createSession(token);
    return res.redirect(
      `https://ping-pong.world/login/success?sessionId=${sessionId}`,
    );
  }

  @Get('me')
  async getChzzkMe(@Query('sessionId') sessionId: string) {
    if (!sessionId) {
      throw new Error('Unauthorized');
    }

    const token = this.authService.getSession(sessionId);
    if (!token) {
      throw new Error('Session expired');
    }

    return await this.chzzkService.getUserInfo(token.accessToken);
  }
}
