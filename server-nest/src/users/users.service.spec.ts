import { ulid } from 'ulid';
import { UsersService } from './users.service';

describe(UsersService, () => {
  let subject: UsersService;

  beforeEach(() => {
    subject = new UsersService();
  });

  ['foo', 'bar', 'baz'].forEach((name) => {
    describe(`#findByUsername(${name})`, () => {
      it(`has a user for ${name}`, async () => {
        const user = await subject.findByUsername(name);
        expect(user).toBeDefined();
      });

      it('user has an id', async () => {
        const user = await subject.findByUsername(name);
        expect(user).toHaveProperty('id');
      });
    });
  });

  describe('non-existing user', () => {
    it('is undefined', async () => {
      const user = await subject.findByUsername(ulid());
      expect(user).toBeUndefined();
    });
  });
});
