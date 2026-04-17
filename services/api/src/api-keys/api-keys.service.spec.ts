import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@tracelite/db';
import { ApiKeysService } from './api-keys.service';

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: PrismaService,
          useValue: {
            apiKey: { create: jest.fn(), findMany: jest.fn(), updateMany: jest.fn() },
            membership: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
