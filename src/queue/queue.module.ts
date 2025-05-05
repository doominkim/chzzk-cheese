import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { WhisperProcessor } from './queue.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: false,
          removeOnFail: false,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'audio-processing',
    }),
    BullModule.registerQueue({
      name: 'whisper-processing',
    }),
    BullBoardModule.forFeature({
      name: 'audio-processing',
      adapter: BullAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'whisper-processing',
      adapter: BullAdapter,
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService, WhisperProcessor],
  exports: [QueueService],
})
export class QueueModule {}
