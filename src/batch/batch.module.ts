import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ChannelModule } from 'src/channel/channel.module';
import { ChzzkModule } from 'src/chzzk/chzzk.module';
import { StreamModule } from 'src/stream/stream.module';
import { DatabasePartitionInitializer } from 'src/common/bootstrap/partition-initializer';

@Module({
  imports: [ChzzkModule, ChannelModule, StreamModule],
  providers: [BatchService, DatabasePartitionInitializer],
})
export class BatchModule {}
