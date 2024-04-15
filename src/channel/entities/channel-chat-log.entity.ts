import { IsJSON, IsString } from 'class-validator';
import { CoreHardEntity } from 'src/common/entities/core-hard.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Channel } from './channel.entity';

@Entity({ name: 'channelChatLog', schema: process.env.DB_SCHEMA_NAME })
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
}
