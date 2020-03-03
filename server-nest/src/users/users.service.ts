import { ulid } from 'ulid';
import { User } from './user.model';

export class UsersService {
  private readonly users: User[];

  constructor() {
    this.users = [
      {
        id: ulid(),
        username: 'foo',
        password: 'bar',
      },
      {
        id: ulid(),
        username: 'bar',
        password: 'baz',
      },
      {
        id: ulid(),
        username: 'baz',
        password: 'boo',
      },
    ];
  }

  async findByUsername(username: string): Promise<User> {
    return this.users.find(user => user.username === username);
  }
}
