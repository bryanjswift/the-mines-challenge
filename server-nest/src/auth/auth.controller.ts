import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '../users/user.model';
import { Request } from '../vendor/request';
import { AuthService, TokenizedUser } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request): Promise<TokenizedUser> {
    if (AuthUser.is(req.user)) {
      return this.authService.login(req.user);
    } else {
      throw new UnauthorizedException('User could not be logged in.');
    }
  }
}
