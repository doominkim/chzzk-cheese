import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerEntity, LogLevel, LogSource } from './logger.entity';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  constructor(
    @InjectRepository(LoggerEntity)
    private readonly logRepository: Repository<LoggerEntity>,
  ) {}

  async log(
    level: LogLevel,
    source: LogSource,
    message: string,
    options: {
      context?: Record<string, any>;
      error?: Error;
    } = {},
  ) {
    try {
      const log = this.logRepository.create({
        level,
        source,
        message,
        context: options.context,
        error: options.error
          ? {
              name: options.error.name,
              message: options.error.message,
              stack: options.error.stack,
              code: (options.error as any).code,
            }
          : undefined,
      });

      await this.logRepository.save(log);

      // 콘솔에도 로깅
      const logMessage = `[${source}] ${message}`;
      switch (level) {
        case LogLevel.DEBUG:
          this.logger.debug(logMessage);
          break;
        case LogLevel.INFO:
          this.logger.log(logMessage);
          break;
        case LogLevel.WARN:
          this.logger.warn(logMessage);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          this.logger.error(logMessage);
          break;
      }
    } catch (error) {
      this.logger.error(`Failed to save log: ${error.message}`);
    }
  }

  async debug(
    source: LogSource,
    message: string,
    context?: Record<string, any>,
  ) {
    await this.log(LogLevel.DEBUG, source, message, { context });
  }

  async info(
    source: LogSource,
    message: string,
    context?: Record<string, any>,
  ) {
    await this.log(LogLevel.INFO, source, message, { context });
  }

  async warn(
    source: LogSource,
    message: string,
    context?: Record<string, any>,
  ) {
    await this.log(LogLevel.WARN, source, message, { context });
  }

  async error(
    source: LogSource,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ) {
    await this.log(LogLevel.ERROR, source, message, { context, error });
  }

  async fatal(
    source: LogSource,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ) {
    await this.log(LogLevel.FATAL, source, message, { context, error });
  }
}
