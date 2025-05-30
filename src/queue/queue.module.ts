import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { WhisperProcessor } from './queue.processor';
import { ChannelModule } from 'src/channel/channel.module';
import { FileSystemModule } from 'src/file-system/file-system.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: 2,
          removeOnFail: 2,
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: 'audio-processing',
        defaultJobOptions: {
          removeOnComplete: 2,
          removeOnFail: 2,
        },
      },
      {
        name: 'whisper-processing',
        defaultJobOptions: {
          removeOnComplete: 2,
          removeOnFail: 2,
        },
      },
    ),
    BullBoardModule.forFeature({
      name: 'audio-processing',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'whisper-processing',
      adapter: BullAdapter,
    }),
    ChannelModule,
    FileSystemModule,
  ],
  controllers: [QueueController],
  providers: [QueueService, WhisperProcessor],
  exports: [QueueService],
})
export class QueueModule {}
