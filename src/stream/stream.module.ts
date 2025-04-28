import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { ChzzkModule } from '../chzzk/chzzk.module';
import { MinioModule } from '../minio/minio.module';
import { ChannelModule } from '../channel/channel.module';
import { FileSystemModule } from '../file-system/file-system.module';

@Module({
  imports: [ChzzkModule, MinioModule, ChannelModule, FileSystemModule],
  controllers: [StreamController],
  providers: [StreamService],
  exports: [StreamService],
})
export class StreamModule {}
