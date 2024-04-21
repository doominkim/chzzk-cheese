import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Channel } from 'src/channel/entities/channel.entity';
import { CoreSoftEntity } from 'src/common/entities/core-soft.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'account', schema: process.env.DB_SCHEMA_NAME })
export class Account extends CoreSoftEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsString()
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsString()
  nickname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsString()
  profileImage: string;

  @Type(() => Boolean)
  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @Column({ type: 'boolean', nullable: false, default: false })
  @IsOptional()
  @IsBoolean()
  activated: boolean;

  @Type(() => Date)
  @IsDate()
  @Column({ type: 'timestamptz', nullable: false })
  loggedinAt: Date;
}
