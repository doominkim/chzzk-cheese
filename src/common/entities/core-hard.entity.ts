import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CoreHardEntity {
  @ApiProperty({
    description: '데이터 ID(PK)',
    readOnly: true,
  })
  @PrimaryGeneratedColumn()
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({
    description: '생성일시',
    readOnly: true,
  })
  @CreateDateColumn({
    type: 'timestamptz',
    name: 'createdAt',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    readOnly: true,
  })
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updatedAt',
  })
  @Expose()
  updatedAt: Date;
}
