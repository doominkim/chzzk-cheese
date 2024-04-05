import { DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CoreHardEntity } from './core-hard.entity';

export class CoreSoftEntity extends CoreHardEntity {
  @ApiProperty({
    description: '삭제일시',
    readOnly: true,
  })
  @DeleteDateColumn({
    type: 'timestamptz',
  })
  @Expose()
  deletedAt: Date;
}
