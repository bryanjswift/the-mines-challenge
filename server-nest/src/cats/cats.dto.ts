import * as io from 'io-ts';
import { DateTime } from '../contracts';

export const CreateCatDto = io.type({
  name: io.string,
  dateOfBirth: DateTime,
  breed: io.string,
});

export type CreateCatDto = io.TypeOf<typeof CreateCatDto>;
