import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { ChzzkModule } from '../chzzk/chzzk.module';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [ChzzkModule, MinioModule],
  controllers: [StreamController],
  providers: [StreamService],
  exports: [StreamService],
})
export class StreamModule {}
