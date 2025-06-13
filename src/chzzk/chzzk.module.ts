import { Module } from '@nestjs/common';
import { ChzzkRepository } from './chzzk.repository';
import { ChzzkService } from './chzzk.service';
import { ChzzkController } from './chzzk.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ChzzkController],
  providers: [ChzzkRepository, ChzzkService],
  exports: [ChzzkService],
})
export class ChzzkModule {}
