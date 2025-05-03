import { IsJSON, IsString } from 'class-validator';
import { Column, ManyToOne, Entity } from 'typeorm';
import { Channel } from './channel.entity';
import { CoreHardEntity } from 'src/common/entities/core-hard.entity';

@Entity({ name: 'channelChatLog', synchronize: false })
export class ChannelChatLog extends CoreHardEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  chatType: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  chatChannelId: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  @IsString()
  message: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsString()
  userIdHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsString()
  nickname: string;

  @ManyToOne(() => Channel, (channel) => channel.channelChatLog)
  channel: Channel;

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  profile: JSON;

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  extras: JSON;

  /**
   * channelChatLog 테이블 생성 DDL
   * - 파티셔닝: createdAt 기준 RANGE
   */
  static createPartitionedTable() {
    return `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_tables WHERE tablename = 'channelChatLog'
        ) THEN
         CREATE TABLE "channelChatLog" (
				  id SERIAL,
				  "chatType" VARCHAR(100) NOT NULL,
				  "chatChannelId" VARCHAR(100) NOT NULL,
				  "message" VARCHAR(2000),
				  "userIdHash" VARCHAR(100),
				  "nickname" VARCHAR(100),
				  "profile" JSONB,
				  "extras" JSONB,
				  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP,
          "channelId" INT NOT NULL,
          FOREIGN KEY ("channelId") REFERENCES "channel"("id")
				) PARTITION BY RANGE ("createdAt");
        END IF;
      END $$;
    `;
  }

  static createPartitionSQL(year: number, month: number) {
    // 예: 2024_06 → 2024-06-01 ~ 2024-07-01
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const toMonth = month === 12 ? 1 : month + 1;
    const toYear = month === 12 ? year + 1 : year;
    const to = `${toYear}-${String(toMonth).padStart(2, '0')}-01`;
    const partitionName = `channelChatLog_${year}_${String(month).padStart(
      2,
      '0',
    )}`;
    return `
      CREATE TABLE IF NOT EXISTS "${partitionName}" PARTITION OF "channelChatLog"
      FOR VALUES FROM ('${from}') TO ('${to}');
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_channelId ON "${partitionName}" ("channelId");
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_chatChannelId ON "${partitionName}" ("chatChannelId");
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_userIdHash ON "${partitionName}" ("userIdHash");
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_nickname ON "${partitionName}" ("nickname");
    `;
  }
}
