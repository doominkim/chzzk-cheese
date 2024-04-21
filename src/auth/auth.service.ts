import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AccountService } from 'src/account/account.service';
import { NaverMeDto } from './dtos/me.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private accountService: AccountService) {}

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

  async loginNaver(accessToken: string) {
    const me = await this.me(accessToken);

    console.log(me);
    return me;
  }
}
