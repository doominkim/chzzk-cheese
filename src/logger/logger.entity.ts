import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export enum LogSource {
  SYSTEM = 'SYSTEM',
  STREAM = 'STREAM',
  CHZZK = 'CHZZK',
  MINIO = 'MINIO',
  DATABASE = 'DATABASE',
  API = 'API',
  AUTH = 'AUTH',
  CHANNEL = 'CHANNEL',
}

@Entity({ name: 'systemLog', schema: process.env.DB_SCHEMA_NAME })
export class LoggerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LogLevel,
    default: LogLevel.INFO,
  })
  @Index()
  level: LogLevel;

  @Column({
    type: 'enum',
    enum: LogSource,
    default: LogSource.SYSTEM,
  })
  @Index()
  source: LogSource;

  @Column('text')
  message: string;

  @Column('json', { nullable: true })
  context?: Record<string, any>;

  @Column('json', { nullable: true })
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
