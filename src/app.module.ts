import { Module } from '@nestjs/common';
import { BatchModule } from './batch/batch.module';
import { ChzzkModule } from './chzzk/chzzk.module';

@Module({
  imports: [BatchModule, ChzzkModule],
})
export class AppModule {}
