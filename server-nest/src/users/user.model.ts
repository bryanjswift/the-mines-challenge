import * as io from 'io-ts';

/**
 * Represent the request body for creating a cat instance as a runtime
 * verifiable type.
 */
export const AuthUser = io.type({
  id: io.string,
  username: io.string,
});

export type AuthUser = io.TypeOf<typeof AuthUser>;

/**
 * Domain model reprsentation of a user.
 */
export class User {
  readonly id: string;
  readonly username: string;
  readonly password: string;
}
