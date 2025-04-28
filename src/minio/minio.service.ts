import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readdirSync, readFileSync } from 'fs';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      endpoint: `http://${this.configService.get(
        'MINIO_ENDPOINT',
      )}:${this.configService.get('MINIO_PORT')}`,
      forcePathStyle: true,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('MINIO_ACCESS_KEY'),
        secretAccessKey: this.configService.get('MINIO_SECRET_KEY'),
      },
    });
    this.bucketName = this.configService.get('MINIO_BUCKET');
  }

  async uploadFile(filePath: string, objectName: string): Promise<string> {
    try {
      const fileContent = readFileSync(filePath);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
        Body: fileContent,
        ContentType: objectName.endsWith('.aac')
          ? 'audio/aac'
          : objectName.endsWith('.jpg')
          ? 'image/jpeg'
          : 'application/octet-stream',
      });

      await this.client.send(command);
      this.logger.debug(`Successfully uploaded ${objectName} to MinIO`);
      return objectName;
    } catch (error) {
      this.logger.error(`Error uploading file ${filePath}: ${error.message}`);
      throw error;
    }
  }

  async uploadDirectory(directoryPath: string, prefix = ''): Promise<string[]> {
    try {
      const files = readdirSync(directoryPath);
      const uploadedFiles: string[] = [];

      for (const file of files) {
        const filePath = join(directoryPath, file);
        const objectName = prefix ? `${prefix}/${file}` : file;

        await this.uploadFile(filePath, objectName);
        uploadedFiles.push(objectName);
      }

      return uploadedFiles;
    } catch (error) {
      this.logger.error(
        `Error uploading directory ${directoryPath}: ${error.message}`,
      );
      throw error;
    }
  }

  async uploadStreamFiles(
    channelId: string,
    liveId: string,
    directoryPath: string,
    options?: {
      audioFiles?: string[];
      imageFiles?: string[];
    },
  ): Promise<{
    audioFiles: string[];
    imageFiles: string[];
  }> {
    try {
      const files = readdirSync(directoryPath);
      const audioFiles: string[] = [];
      const imageFiles: string[] = [];

      for (const file of files) {
        try {
          if (
            file.endsWith('.aac') &&
            (!options?.audioFiles || options.audioFiles.includes(file))
          ) {
            const objectName = `channels/${channelId}/live/${liveId}/audios/${file}`;
            await this.uploadFile(join(directoryPath, file), objectName);
            audioFiles.push(file);
          } else if (
            file.endsWith('.jpg') &&
            (!options?.imageFiles || options.imageFiles.includes(file))
          ) {
            const objectName = `channels/${channelId}/live/${liveId}/images/${file}`;
            await this.uploadFile(join(directoryPath, file), objectName);
            imageFiles.push(file);
          }
        } catch (error) {
          this.logger.error(`Error processing file ${file}: ${error.message}`);
          continue;
        }
      }

      return { audioFiles, imageFiles };
    } catch (error) {
      this.logger.error(`Error uploading stream files: ${error.message}`);
      throw error;
    }
  }
}
