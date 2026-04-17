import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  it('getProfile returns request user', () => {
    const user = { userId: 'user-1', email: 'a@b.com' };
    expect(appController.getProfile({ user } as never)).toEqual(user);
  });
});
