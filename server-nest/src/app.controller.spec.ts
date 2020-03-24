import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const req = {
  user: {
    foo: 'bar',
  },
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('GET /profile', () => {
    it('should do the thing', () => {
      const request = req as unknown as Request;
      expect(appController.getProfile(request)).toEqual({ foo: 'bar' });
    });
  });
});
