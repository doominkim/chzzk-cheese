import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { ChzzkModule } from '../chzzk/chzzk.module';
import { StreamController } from './stream.controller';

@Module({
  imports: [ChzzkModule],
  providers: [StreamService],
  controllers: [StreamController],
  exports: [StreamService],
})
export class StreamModule {}
