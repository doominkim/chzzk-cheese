import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountModule } from 'src/account/account.module';
import { ChzzkModule } from 'src/chzzk/chzzk.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AccountModule, ChzzkModule, HttpModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
