export enum FileType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export const FILE_SYSTEM_CONSTANTS = {
  DEFAULT_STORAGE_PATH: 'storage',
  MAX_FILE_SIZE: 1024 * 1024 * 100, // 100MB
  ALLOWED_FILE_TYPES: ['image', 'audio', 'video', 'document'],
} as const;

export interface FileMetadata {
  [key: string]: any;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bitrate?: number;
  channels?: number;
  sampleRate?: number;
}
