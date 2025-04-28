import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { FileService } from './services/file.service';
import { FileRepository } from './repositories/file.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileSystemModule {}
