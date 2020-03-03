import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

const validator = AuthService.prototype.validateUser;
type User = ReturnType<typeof validator>;

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): User {
    const user = await this.authService.validateUser(username, password);
    if (user === undefined) {
      throw new UnauthorizedException(
        'Unable to authenticate.',
        'not_authorized'
      );
    } else {
      return user;
    }
  }
}
