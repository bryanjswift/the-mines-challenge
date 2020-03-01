import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from '../logger.middleware';
import { CatsController } from './cats.controller';
import { CatsResolver } from './cats.resolver';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsResolver, CatsService],
  exports: [CatsService],
})
export class CatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CatsController);
  }
}
