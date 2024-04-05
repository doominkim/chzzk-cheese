import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExportChzzkService } from 'src/chzzk/export-chzzk.service';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor() {}

  @Cron('*/10 * * * * *', {
    name: 'updateChannels',
  })
  updateChannels() {
    this.logger.debug('Called when the current second is 45');
  }
}
