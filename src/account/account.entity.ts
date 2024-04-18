import { CoreSoftEntity } from 'src/common/entities/core-soft.entity';
import { Entity } from 'typeorm';

@Entity({ name: 'account', schema: process.env.DB_SCHEMA_NAME })
export class Account extends CoreSoftEntity {}
