import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { CoreHardEntity } from 'src/common/entities/core-hard.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { ChannelLive } from './channel-live.entity';

@Entity({ name: 'channel', schema: process.env.DB_SCHEMA_NAME })
export class Channel extends CoreHardEntity {
  @Column({ type: 'varchar', length: 40, nullable: false })
  @IsString()
  channelId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  channelName: string;

  @Column({ type: 'varchar', length: 2048, nullable: false })
  @IsString()
  channelImageUrl: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsString()
  channelDescription: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  @IsBoolean()
  openLive: boolean;

  @Column({ type: 'int4', nullable: true, default: 0 })
  @IsNumber()
  follower: number;

  @OneToMany(() => ChannelLive, (channelLive) => channelLive.channel)
  @JoinColumn()
  channelLive: ChannelLive;
}
