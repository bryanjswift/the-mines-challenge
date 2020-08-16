import { Controller, Get, Request as Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtPayload } from './auth/jwt.model';
import { Request } from './vendor/request';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/ping')
  getPing(): string {
    return 'PONG';
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Req() req: Request): JwtPayload {
    // This is a safe cast because the JwtStrategy#validate method invoked by
    // the `JwtAuthGuard` returns the `req.user` value.
    return req.user as JwtPayload;
  }
}
