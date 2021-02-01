import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from '../logger.middleware';
import { createClientPool } from '../vendor/db';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  controllers: [GameController],
  providers: [
    GameService,
    {
      provide: 'DB_POOL',
      useValue: createClientPool({
        connectionString: 'postgresql://root:root@localhost:5432/mines_db',
      }),
    },
  ],
  exports: [GameService],
})
export class GameModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes(GameController);
  }
}
