import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@tracelite/db';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            membership: { findUnique: jest.fn() },
            aggregatedMetric: { findMany: jest.fn() },
            requestLog: { findMany: jest.fn() },
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
