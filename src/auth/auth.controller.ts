import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('naverLogin')
  async naverLogin(): Promise<void> {
    await this.authService.naverLogin();
  }
}
