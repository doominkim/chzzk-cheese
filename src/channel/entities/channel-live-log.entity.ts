import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { CoreHardEntity } from 'src/common/entities/core-hard.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ChannelLive } from './channel-live.entity';

@Entity({ name: 'channelLiveLog', schema: process.env.DB_SCHEMA_NAME })
export class ChannelLiveLog extends CoreHardEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  liveTitle: string;

  @Column({ type: 'int4', nullable: false })
  @IsNumber()
  concurrentUserCount: number;

  @Column({ type: 'int4', nullable: false })
  @IsNumber()
  accumulateCount: number;

  @Column({ type: 'int4', nullable: false })
  @IsNumber()
  minFollowerMinute: number;

  @ManyToOne(() => ChannelLive, (channelLive) => channelLive.liveLog)
  channelLive: ChannelLive;
}
