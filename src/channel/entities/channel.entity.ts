import { CoreHardEntity } from 'src/common/entities/core-hard.entity';
import { Entity } from 'typeorm';

@Entity({ name: 'channel', schema: process.env.DB_SCHEMA_NAME })
export class Channel extends CoreHardEntity {}
