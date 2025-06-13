import { Injectable, Logger } from '@nestjs/common';
import { ChzzkRepository } from './chzzk.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenRevokeRequestDto,
} from './dtos/auth.dto';

@Injectable()
export class ChzzkService {
  private readonly logger = new Logger(ChzzkService.name);
  private readonly baseUrl = 'https://chzzk.naver.com';
  private readonly openApiUrl = 'https://openapi.chzzk.naver.com';

  constructor(
    private chzzkRepository: ChzzkRepository,
    private readonly httpService: HttpService,
  ) {}

  async getChannelsByKeyword(keyword: string) {
    return this.chzzkRepository.getChannelsByKeyword(keyword);
  }

  async getChannelById(channelId: string) {
    return this.chzzkRepository.getChannelById(channelId);
  }

  async getChannelLiveStatus(channelId: string) {
    return this.chzzkRepository.getChannelLiveStatus(channelId);
  }

  async getChannelLiveDetail(channelId: string) {
    return this.chzzkRepository.getChannelLiveDetail(channelId);
  }

  async joinChannel(channelId: string) {
    return this.chzzkRepository.joinChannel(channelId);
  }

  async leaveChannel(channelId: string) {
    return this.chzzkRepository.leaveChannel(channelId);
  }

  async getToken(tokenRequestDto: TokenRequestDto): Promise<TokenResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<TokenResponseDto>(
          `${this.baseUrl}/auth/v1/token`,
          tokenRequestDto,
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Token request failed: ${error.message}`);
      throw error;
    }
  }

  async revokeToken(
    tokenRevokeRequestDto: TokenRevokeRequestDto,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/auth/v1/token/revoke`,
          tokenRevokeRequestDto,
        ),
      );
    } catch (error) {
      this.logger.error(`Token revoke failed: ${error.message}`);
      throw error;
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.openApiUrl}/open/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      console.log(response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Get user info failed: ${error.message}`);
      throw error;
    }
  }
}
