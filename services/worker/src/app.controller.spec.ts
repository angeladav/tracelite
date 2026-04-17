import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsumerService } from './consumer/consumer.service';
import { PrismaService } from '@tracelite/db';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: { $queryRaw: jest.fn().mockResolvedValue(1) },
        },
        {
          provide: ConsumerService,
          useValue: {
            ensureConsumerGroup: jest.fn(),
            runStreamConsumer: jest.fn(),
            runFallbackDrainer: jest.fn(),
            stopWorker: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
