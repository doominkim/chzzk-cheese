import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ChannelModule } from 'src/channel/channel.module';
import { ChzzkModule } from 'src/chzzk/chzzk.module';
import { StreamModule } from 'src/stream/stream.module';
import { DatabasePartitionInitializer } from 'src/common/bootstrap/partition-initializer';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [ChzzkModule, ChannelModule, StreamModule, QueueModule],
  providers: [BatchService, DatabasePartitionInitializer],
})
export class BatchModule {}
