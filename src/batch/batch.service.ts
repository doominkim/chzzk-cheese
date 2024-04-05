import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  @Cron('*/1 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
    // this.logger.error('zz');
    // this.logger.warn('warn');
  }

  @Cron('*/1 * * * * *')
  handleCronError() {
    // this.logger.debug('Called when the current second is 45');
    this.logger.error('zz');
    // this.logger.warn('warn');
  }
}
