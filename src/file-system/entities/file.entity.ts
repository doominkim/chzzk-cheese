import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { FileType, FileMetadata } from '../types';
import { CoreHardEntity } from 'src/common/entities/core-hard.entity';

@Entity({
  name: 'file',
  schema: process.env.DB_SCHEMA_NAME,
  synchronize: false,
})
export class File extends CoreHardEntity {
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

  @Column({ default: false })
  analyzed: boolean;

  static createPartitionedTable() {
    return `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_tables WHERE tablename = 'file'
        ) THEN
        CREATE TABLE "file" (
        id SERIAL,
        "ownerId" VARCHAR NOT NULL,
        "filePath" VARCHAR NOT NULL,
        "fileType" VARCHAR NOT NULL,
        "originalName" VARCHAR NOT NULL,
        "fileSize" INT NOT NULL,
        "mimeType" VARCHAR NOT NULL,
        "metadata" JSONB,
        "isPublic" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        "analyzed" BOOLEAN DEFAULT false
        ) PARTITION BY RANGE ("createdAt");
        END IF;
      END $$;
    `;
  }

  static createPartitionSQL(year: number, month: number) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const toMonth = month === 12 ? 1 : month + 1;
    const toYear = month === 12 ? year + 1 : year;
    const to = `${toYear}-${String(toMonth).padStart(2, '0')}-01`;
    const partitionName = `file_${year}_${String(month).padStart(2, '0')}`;
    return `
      CREATE TABLE IF NOT EXISTS "${partitionName}" PARTITION OF "file"
      FOR VALUES FROM ('${from}') TO ('${to}');
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_ownerId ON "${partitionName}" ("ownerId");
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_filePath ON "${partitionName}" ("filePath");
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_analyzed ON "${partitionName}" ("analyzed");
      CREATE INDEX IF NOT EXISTS idx_${partitionName}_createdAt ON "${partitionName}" ("createdAt");
    `;
  }
}
