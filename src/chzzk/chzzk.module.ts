import { Module } from '@nestjs/common';
import { ChzzkService } from './services/chzzk.service';
import { ChzzkController } from './controllers/chzzk.controller';

@Module({
  controllers: [ChzzkController],
  providers: [ChzzkService],
})
export class ChzzkModule {}
