import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const DEFAULT_USERS = [
  { username: 'foo', password: 'bar' },
  { username: 'bar', password: 'baz' },
  { username: 'baz', password: 'boo' },
];

describe(AuthService, () => {
  let subject: AuthService;

  beforeEach(() => {
    const jwtService = new JwtService({ secret: 'foo' });
    const usersService = new UsersService();
    subject = new AuthService(usersService, jwtService);
  });

  DEFAULT_USERS.forEach((record) => {
    const { username, password } = record;
    const badPassword = `${password}Foo`;

    describe(`#validateUser(${username}, ${password})`, () => {
      let authUser: Record<string, string>;

      beforeEach(async () => {
        authUser = await subject.validateUser(username, password);
      });

      it('exists', () => {
        expect(authUser).toBeDefined();
      });

      it('has an id', () => {
        expect(authUser).toHaveProperty('id');
      });

      it('has a username', () => {
        expect(authUser).toHaveProperty('username', username);
      });

      it('does not have a password', () => {
        expect(authUser).not.toHaveProperty('password');
      });
    });

    describe(`#validateUser(${username}, ${badPassword})`, () => {
      it('throws an error for incorrect password', () => {
        expect(
          subject.validateUser(username, badPassword)
        ).rejects.toBeInstanceOf(UnauthorizedException);
      });
    });
  });

  describe('#login', () => {
    it('generates an access token', async () => {
      const result = await subject.login({ id: 'foo', username: 'bar' });
      expect(result).toHaveProperty('access_token');
    });
  });
});
