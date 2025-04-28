import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { FileType } from '../types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FileRepository extends Repository<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findByOwner(ownerId: string): Promise<FileEntity[]> {
    return this.find({ where: { ownerId } });
  }

  async findByType(fileType: FileType): Promise<FileEntity[]> {
    return this.find({ where: { fileType } });
  }

  async findByPath(filePath: string): Promise<FileEntity | undefined> {
    return this.findOne({ where: { filePath } });
  }
}
