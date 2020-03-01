import { Field, ObjectType } from 'type-graphql';
/**
 * Domain model reprsentation of a cat.
 */
@ObjectType()
export class Cat {
  /** Unique identifier for this cat. */
  @Field()
  id: string;
  /** Name for this cat. */
  @Field()
  name: string;
  /** ISO8601 date time at which this cat was born. */
  @Field()
  dateOfBirth: string;
  /** Breed of this cat. */
  @Field()
  breed: string;
}
