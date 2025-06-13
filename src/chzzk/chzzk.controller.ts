import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ChzzkService } from './chzzk.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenRevokeRequestDto,
} from './dtos/auth.dto';

@ApiTags('치지직 모듈연동')
@Controller('chzzk')
export class ChzzkController {
  constructor(private readonly chzzkService: ChzzkService) {}

  @Get('channels/search/:keyword')
  @ApiOperation({ summary: '채널 검색' })
  @ApiResponse({ status: 200, description: '채널 검색 결과' })
  async getChannelsByKeyword(@Param('keyword') keyword: string) {
    console.log('keyword =>', keyword);

    return await this.chzzkService.getChannelsByKeyword(keyword);
  }

  @Get('channels/:channelId')
  @ApiOperation({ summary: '채널 정보 조회' })
  @ApiResponse({ status: 200, description: '채널 정보' })
  async getChannelById(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelById(channelId);
  }

  @Get('channels/:channelId/live-status')
  @ApiOperation({ summary: '채널 라이브 상태 조회' })
  @ApiResponse({ status: 200, description: '채널 라이브 상태' })
  async getChannelLiveStatus(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelLiveStatus(channelId);
  }

  @Get('channels/:channelId/live-detail')
  @ApiOperation({ summary: '채널 라이브 상세 정보 조회' })
  @ApiResponse({ status: 200, description: '채널 라이브 상세 정보' })
  async getChannelLiveDetail(@Param('channelId') channelId: string) {
    console.log('channelId =>', channelId);

    return await this.chzzkService.getChannelLiveDetail(channelId);
  }

  @Post('channels/:channelId/join')
  @ApiOperation({ summary: '채널 참여' })
  @ApiResponse({ status: 200, description: '채널 참여 성공' })
  async joinChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.chzzkService.joinChannel(channelId);
  }

  @Delete('channels/:channelId/leave')
  @ApiOperation({ summary: '채널 퇴장' })
  @ApiResponse({ status: 200, description: '채널 퇴장 성공' })
  async leaveChannel(@Param('channelId') channelId: string): Promise<any> {
    return await this.chzzkService.leaveChannel(channelId);
  }

  @Post('auth/token')
  @ApiOperation({ summary: '토큰 발급' })
  @ApiResponse({
    status: 200,
    description: '토큰 발급 성공',
    type: TokenResponseDto,
  })
  async getToken(@Body() tokenRequestDto: TokenRequestDto) {
    return this.chzzkService.getToken(tokenRequestDto);
  }

  @Post('auth/token/revoke')
  @ApiOperation({ summary: '토큰 폐기' })
  @ApiResponse({ status: 200, description: '토큰 폐기 성공' })
  async revokeToken(@Body() tokenRevokeRequestDto: TokenRevokeRequestDto) {
    return this.chzzkService.revokeToken(tokenRevokeRequestDto);
  }
}
