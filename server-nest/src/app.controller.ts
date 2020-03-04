import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtPayload } from './auth/jwt.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Req() req: Request): JwtPayload {
    // This is a safe cast because the JwtStrategy#validate method invoked by
    // the `JwtAuthGuard` returns the `req.user` value.
    return req.user as JwtPayload;
  }
}
