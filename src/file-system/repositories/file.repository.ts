import { Repository, Between } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { FileType } from '../types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFileDto } from '../dto/create-file.dto';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {}

  async createFile(file: CreateFileDto): Promise<FileEntity> {
    const instance = this.repository.create(file);
    return this.repository.save(instance);
  }
}
