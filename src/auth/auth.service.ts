import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AccountService } from 'src/account/account.service';
import { NaverMeDto } from './dtos/me.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly sessionStore = new Map<string, any>();

  constructor(
    private accountService: AccountService,
    private readonly httpService: HttpService,
  ) {}

  async me(accessToken: string): Promise<NaverMeDto> {
    const result = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.status !== 200) {
      throw new Error('openapi.naver.com/v1/nid/me request failed)');
    }

    if (result.data['resultcode'] !== '00') {
      throw new Error('openapi.naver.com/v1/nid/me request failed (00)');
    }

    const naverMeDto = new NaverMeDto();
    naverMeDto.id = result.data.response.id;
    naverMeDto.nickname = result.data.response.nickname;
    naverMeDto.profileImage = result.data.response.profile_image;
    naverMeDto.age = result.data.response.age;
    naverMeDto.gender = result.data.response.gender;
    naverMeDto.mobile = result.data.response.mobile;
    naverMeDto.name = result.data.response.name;
    naverMeDto.birthday = result.data.response.birthday;
    naverMeDto.birthyear = result.data.response.birthyear;

    return naverMeDto;
  }

  async loginNaver(accessToken: string): Promise<NaverMeDto> {
    const response = await firstValueFrom(
      this.httpService.get<NaverMeDto>('https://openapi.naver.com/v1/nid/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );
    return response.data;
  }

  createSession(token: any): string {
    const sessionId = uuidv4();
    this.sessionStore.set(sessionId, token);
    return sessionId;
  }

  getSession(sessionId: string): any {
    return this.sessionStore.get(sessionId);
  }

  removeSession(sessionId: string): void {
    this.sessionStore.delete(sessionId);
  }
}
