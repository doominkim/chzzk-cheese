import { IsString } from 'class-validator';
import { CoreHardEntity } from 'src/common/entities/core-hard.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'channelLiveTranscript', schema: process.env.DB_SCHEMA_NAME })
export class ChannelLiveTranscript extends CoreHardEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  channelId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  liveId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  fileUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  startTime: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  endTime: string;

  @Column({ type: 'text', nullable: false })
  @IsString()
  text: string;
}
