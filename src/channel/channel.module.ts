import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from './entities/channel.entity';
import { ChannelController } from './controllers/chzzk.controller';
import { ChannelService } from './services/chzzk.service';
import { ChannelChatLogEntity } from './entities/channel-chat-log.entity';
import { ChannelLiveLogEntity } from './entities/channel-live-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelEntity,
      ChannelChatLogEntity,
      ChannelLiveLogEntity,
    ]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
