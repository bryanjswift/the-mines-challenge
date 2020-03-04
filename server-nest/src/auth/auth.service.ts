import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser, User } from '../users/user.model';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt.model';

export interface TokenizedUser {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    password: string
  ): Promise<Omit<User, 'password'>> {
    // TODO: Authenticate securely
    const user = await this.usersService.findByUsername(username);
    if (user !== undefined && user.password === password) {
      const { password, ...result } = user;
      return result;
    } else {
      throw new UnauthorizedException(
        `Unable to authenticate ${username}`,
        'not_authorized'
      );
    }
  }

  async login(user: AuthUser): Promise<TokenizedUser> {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
    };
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: this.jwtService.sign(payload),
    };
  }
}
