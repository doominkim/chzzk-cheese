import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFileDto } from '../dto/create-file.dto';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File)
    private repository: Repository<File>,
  ) {}

  async createFile(file: CreateFileDto): Promise<File> {
    const instance = this.repository.create(file);
    return this.repository.save(instance);
  }
}
