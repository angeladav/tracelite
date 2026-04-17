import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@tracelite/db';
import { AggregationService } from './aggregation.service';

describe('AggregationService', () => {
  let service: AggregationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AggregationService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<AggregationService>(AggregationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
