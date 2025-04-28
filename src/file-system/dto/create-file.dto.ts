import { FileType, FileMetadata } from '../types';

export class CreateFileDto {
  ownerId: string;
  filePath: string;
  fileType: FileType;
  originalName: string;
  fileSize: number;
  mimeType: string;
  metadata?: FileMetadata;
  isPublic?: boolean;
}
