import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ChannelModule } from 'src/channel/channel.module';
import { ChzzkModule } from 'src/chzzk/chzzk.module';
import { StreamModule } from 'src/stream/stream.module';

@Module({
  imports: [ChzzkModule, ChannelModule, StreamModule],
  providers: [BatchService],
})
export class BatchModule {}
