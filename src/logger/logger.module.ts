import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { LoggerEntity } from './logger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoggerEntity])],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
