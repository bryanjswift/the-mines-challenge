import { Field, ObjectType } from 'type-graphql';
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
@ObjectType()
export class User {
  @Field()
  readonly id: string;
  @Field()
  readonly username: string;
  readonly password: string;
}
