import { Injectable, NotFoundException } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { FileType } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { FileEntity } from '../entities/file.entity';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  async createFile(dto: CreateFileDto): Promise<FileEntity> {
    return this.fileRepository.save(dto);
  }

  async updateFile(id: number, dto: UpdateFileDto): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return this.fileRepository.save({ ...file, ...dto });
  }

  async deleteFile(id: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const fullPath = path.join(process.cwd(), file.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.fileRepository.remove(file);
  }

  async getFileMetadata(filePath: string): Promise<any> {
    // TODO: ffmpeg, sharp 등으로 메타데이터 추출 구현
    return {};
  }

  async findByOwner(ownerId: string): Promise<FileEntity[]> {
    return this.fileRepository.findByOwner(ownerId);
  }

  async findByType(fileType: FileType): Promise<FileEntity[]> {
    return this.fileRepository.findByType(fileType);
  }
}
