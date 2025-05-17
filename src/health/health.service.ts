import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { QueueService } from '../queue/queue.service';

interface ServiceStatus {
  name: string;
  status: 'up' | 'down';
  responseTime: string;
  error?: string;
}

interface HealthStatus {
  status: 'up' | 'down';
  timestamp: string;
  services: {
    workers: ServiceStatus[];
    collectors: ServiceStatus[];
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly collectorUrl = 'http://localhost:3001/apis';
  private readonly timeout = 5000; // 5초 타임아웃

  constructor(
    private readonly httpService: HttpService,
    private readonly queueService: QueueService,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    const status: HealthStatus = {
      status: 'down', // 기본값을 down으로 설정
      timestamp: new Date().toISOString(),
      services: {
        workers: [],
        collectors: [],
      },
    };

    // 수집 서버 상태 체크 (단순 연결 체크)
    try {
      const startTime = Date.now();
      const response = await firstValueFrom(
        this.httpService.get(this.collectorUrl).pipe(timeout(this.timeout)),
      );
      const endTime = Date.now();

      status.services.collectors.push({
        name: 'collector',
        status: 'up',
        responseTime: `${endTime - startTime}ms`,
      });
      status.status = 'up'; // API 호출 성공 시 status를 up으로 설정
    } catch (error) {
      this.logger.error(`Collector health check failed: ${error.message}`);

      let errorMessage = 'Failed to connect to collector server';
      if (error.code === 'EADDRNOTAVAIL') {
        errorMessage = 'Collector server address not available';
      } else if (error.name === 'TimeoutError') {
        errorMessage = 'Collector server connection timeout';
      }

      status.services.collectors.push({
        name: 'collector',
        status: 'down',
        responseTime: '-1ms',
        error: errorMessage,
      });
    }

    // QueueService의 워커 상태 가져오기
    const workers = this.queueService.getWorkersHealth();

    // 각 워커의 상태를 services에 추가
    for (const [name, worker] of workers) {
      status.services.workers.push({
        name,
        status: worker.isHealthy ? 'up' : 'down',
        responseTime: `${worker.responseTime}ms`,
        error: worker.isHealthy ? undefined : 'Worker is not healthy',
      });

      if (!worker.isHealthy) {
        status.status = 'down';
      }
    }

    return status;
  }
}
