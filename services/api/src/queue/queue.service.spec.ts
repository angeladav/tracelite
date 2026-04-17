import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            xadd: jest.fn().mockResolvedValue('1-0'),
            lpush: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
