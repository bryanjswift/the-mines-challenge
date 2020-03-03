import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: unknown): Promise<JwtPayload> {
    const result = JwtPayload.decode(payload);
    switch (result._tag) {
      case 'Left':
        // This should never happen.
        throw new UnauthorizedException(
          'Invalid JWT provided.',
          'not_authorized'
        );
      case 'Right':
        return result.right;
    }
  }
}
