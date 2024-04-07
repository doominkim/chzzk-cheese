import { Module } from '@nestjs/common';
import { ChzzkRepository } from './chzzk.repository';
import { ChzzkService } from './chzzk.service';
import { ChzzkController } from './chzzk.controller';

@Module({
  controllers: [ChzzkController],
  providers: [ChzzkRepository, ChzzkService],
  exports: [ChzzkService],
})
export class ChzzkModule {}
