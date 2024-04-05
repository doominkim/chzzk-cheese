import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ChannelModule } from 'src/channel/channel.module';
import { ChzzkModule } from 'src/chzzk/chzzk.module';

@Module({
  imports: [ChzzkModule, ChannelModule],
  providers: [BatchService],
})
export class BatchModule {}
