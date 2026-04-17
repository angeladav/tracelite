import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { PrismaService } from '@tracelite/db';
import { QueueService } from '../queue/queue.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: PrismaService, useValue: { requestLog: { create: jest.fn() } } },
        { provide: QueueService, useValue: { enqueue: jest.fn().mockResolvedValue('1-0') } },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
