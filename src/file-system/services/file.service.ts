import { Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository';
import { CreateFileDto } from '../dto/create-file.dto';
import { FileEntity } from '../entities/file.entity';
import { FileType } from '../types';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  async createFile(createFileDto: CreateFileDto): Promise<FileEntity> {
    return this.fileRepository.createFile(createFileDto);
  }
}
