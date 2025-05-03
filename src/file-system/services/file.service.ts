import { Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository';
import { CreateFileDto } from '../dto/create-file.dto';
import { File } from '../entities/file.entity';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  async createFile(createFileDto: CreateFileDto): Promise<File> {
    return this.fileRepository.createFile(createFileDto);
  }
}
