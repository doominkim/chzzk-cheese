import { Injectable } from '@nestjs/common';
import { ChannelChatLog } from 'src/channel/entities/channel-chat-log.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabasePartitionInitializer {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const entities = [ChannelChatLog];

    for (const entity of entities) {
      const createMasterTable = entity.createPartitionedTable();
      const now = new Date();

      const nextPartition = entity.createPartitionSQL(
        now.getFullYear(),
        now.getMonth() + 1,
      );

      await this.dataSource.query(createMasterTable);
      await this.dataSource.query(nextPartition);
    }
  }
}
