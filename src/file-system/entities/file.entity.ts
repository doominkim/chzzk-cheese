import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { FileType, FileMetadata } from '../types';

@Entity('files')
@Index(['ownerId', 'filePath'], { unique: true })
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: string;

  @Column()
  filePath: string;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.OTHER,
  })
  fileType: FileType;

  @Column()
  originalName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column('simple-json', { nullable: true })
  metadata: FileMetadata;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
