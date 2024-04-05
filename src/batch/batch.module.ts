import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports: [ChannelModule],
  providers: [BatchService],
})
export class BatchModule {}
