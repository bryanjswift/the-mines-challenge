import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from '../logger.middleware';
import { GameController } from './game.controller';
import { GamesResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  controllers: [GameController],
  providers: [GamesResolver, GameService],
  exports: [GameService],
})
export class GameModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes(GameController);
  }
}
