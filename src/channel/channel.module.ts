import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelController } from './controllers/channel.controller';
import { ChannelService } from './services/channel.service';
import { Channel } from './entities/channel.entity';
import { ChannelChatLog } from './entities/channel-chat-log.entity';
import { ChannelLiveLog } from './entities/channel-live-log.entity';
import { ChzzkModule } from 'chzzk-z';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelChatLog, ChannelLiveLog]),
    ChzzkModule,
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
