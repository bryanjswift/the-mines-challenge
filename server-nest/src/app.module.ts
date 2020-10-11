import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatsModule } from './cats';
import { GameModule } from './game';

@Module({
  imports: [AuthModule, CatsModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
