import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FileService } from './services/file.service';
import { FileRepository } from './repositories/file.repository';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileService, FileRepository],
  exports: [FileService, FileRepository],
})
export class FileSystemModule {}
