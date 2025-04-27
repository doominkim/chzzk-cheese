import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post('start/:channelId')
  async startRecording(@Param('channelId') channelId: string) {
    return this.streamService.startRecording(channelId);
  }

  @Delete('stop')
  async stopRecording() {
    return this.streamService.stopRecording();
  }
}
