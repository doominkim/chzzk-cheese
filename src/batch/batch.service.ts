import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor() {}

  //   @Cron('*/1 * * * * *', {
  //     name: 'job1',
  //   })
  //   handleCron() {
  //     this.logger.debug('Called when the current second is 45');
  //   }
}
