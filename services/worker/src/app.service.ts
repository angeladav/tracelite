import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '@tracelite/db';
import { ConsumerService } from './consumer/consumer.service';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly prisma: PrismaService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(): Promise<{ status: string; db: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'connected' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        db: 'disconnected',
      });
    }
  }

  async onModuleInit(): Promise<void> {
    await this.consumerService.ensureConsumerGroup();
    void this.consumerService.runStreamConsumer();
    void this.consumerService.runFallbackDrainer();
  }

  onModuleDestroy(): void {
    this.consumerService.stopWorker();
  }
}
