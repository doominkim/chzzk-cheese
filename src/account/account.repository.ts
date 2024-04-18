import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private repository: Repository<Account>,
  ) {}
}
