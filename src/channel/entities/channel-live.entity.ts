import { IsBoolean, IsNumber, IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Channel } from './channel.entity';
import { CoreSoftEntity } from 'src/common/entities/core-soft.entity';
import { ChannelLiveLog } from './channel-live-log.entity';
import { ChannelLiveCategory } from './channel-live-category.entity';

@Entity({ name: 'channelLive', schema: process.env.DB_SCHEMA_NAME })
export class ChannelLive extends CoreSoftEntity {
  @Column({ type: 'int4', nullable: false })
  @IsNumber()
  liveId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  liveTitle: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  chatChannelId: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  @IsBoolean()
  chatActive: boolean;

  // @Column({ type: 'varchar', length: 100, nullable: false })
  // @IsString()
  // chatAvailableGroup: string;

  // @Column({ type: 'varchar', length: 100, nullable: false })
  // @IsString()
  // chatAvailableCondition: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  @IsBoolean()
  status: boolean;

  @ManyToOne(() => Channel, (channel) => channel.channelLive)
  channel: Channel;

  @OneToMany(
    () => ChannelLiveLog,
    (channelLiveLog) => channelLiveLog.channelLive,
  )
  @JoinColumn()
  liveLog: ChannelLiveLog;

  @ManyToOne(
    () => ChannelLiveCategory,
    (channelLiveCategory) => channelLiveCategory.id,
  )
  @JoinColumn()
  liveCategory: ChannelLiveCategory;
}
