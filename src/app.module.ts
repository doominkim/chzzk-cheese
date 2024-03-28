import { Module } from '@nestjs/common';
import { BatchModule } from './batch/batch.module';
import { ChzzkModule } from './chzzk/chzzk.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    BatchModule,
    ChzzkModule,
  ],
})
export class AppModule {}
