import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConsumerService } from './consumer/consumer.service';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly consumerService: ConsumerService
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): { status: string } {
    return { status: 'ok' };
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
