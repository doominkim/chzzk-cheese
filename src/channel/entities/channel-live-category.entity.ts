import { IsString } from 'class-validator';
import { CoreHardEntity } from 'src/common/entities/core-hard.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity({ name: 'channelLiveCategory', schema: process.env.DB_SCHEMA_NAME })
@Unique(['categoryType', 'liveCategory'])
export class ChannelLiveCategory extends CoreHardEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  categoryType: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  liveCategory: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @IsString()
  liveCategoryValue: string;
}
