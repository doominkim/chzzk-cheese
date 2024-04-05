import { Module } from '@nestjs/common';
import { ChzzkRepository } from './chzzk.repository';
import { ExportChzzkService } from './export-chzzk.service';
import { ChzzkController } from './chzzk.controller';

@Module({
  controllers: [ChzzkController],
  providers: [ChzzkRepository, ExportChzzkService],
  exports: [ExportChzzkService],
})
export class ChzzkModule {}
