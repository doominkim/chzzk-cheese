import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, OneToMany, Unique } from 'typeorm';
import { ChannelLive } from './channel-live.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { CoreSoftEntity } from 'src/common/entities/core-soft.entity';
import { ChannelChatLog } from './channel-chat-log.entity';

@Entity({ name: 'channel', schema: process.env.DB_SCHEMA_NAME })
@Unique(['uuid'])
export class Channel extends CoreSoftEntity {
  @Expose()
  @ApiProperty({
    required: true,
    type: String,
  })
  @Column({ type: 'varchar', length: 40, nullable: false })
  @IsString()
  uuid: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsOptional()
  @IsString()
  channelName: string;

  @ApiProperty({
    required: true,
    type: String,
  })
  @Column({ type: 'varchar', length: 2048, nullable: true })
  @IsString()
  channelImageUrl: string;

  @ApiProperty({
    required: false,
    type: String,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  @IsString()
  channelDescription: string;

  @Type(() => Boolean)
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @Column({ type: 'boolean', nullable: false, default: false })
  @IsOptional()
  @IsBoolean()
  openLive: boolean;

  @Type(() => Number)
  @ApiProperty({
    required: false,
    type: Number,
  })
  @Column({ type: 'int4', nullable: true, default: 0 })
  @IsNumber()
  follower: number;

  @OneToMany(() => ChannelLive, (channelLive) => channelLive.channel)
  @JoinColumn()
  channelLive: ChannelLive;

  @OneToMany(() => ChannelChatLog, (channelChatLog) => channelChatLog.channel)
  @JoinColumn()
  channelChatLog: ChannelChatLog;

  @Type(() => Boolean)
  @Transform(({ value }) => Boolean(value))
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @Column({ type: 'boolean', nullable: false, default: false })
  @IsOptional()
  @IsBoolean()
  isChatCollected: boolean;
}
