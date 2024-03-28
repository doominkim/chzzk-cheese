import { Module } from '@nestjs/common';
import { ChzzkService } from './chzzk.service';
import { ChzzkController } from './chzzk.controller';

@Module({
  controllers: [ChzzkController],
  providers: [ChzzkService],
})
export class ChzzkModule {}
