import { Field, InputType } from '@nestjs/graphql';
import * as io from 'io-ts';
import { DateTime } from '../contracts';

/**
 * Represent the request body for creating a cat instance as a runtime
 * verifiable type.
 */
export const CreateCatDto = io.type({
  name: io.string,
  dateOfBirth: DateTime,
  breed: io.string,
});

export type CreateCatDto = io.TypeOf<typeof CreateCatDto>;

@InputType()
export class CreateCatInput {
  @Field()
  name: string;
  @Field()
  dateOfBirth: string;
  @Field()
  breed: string;
}
