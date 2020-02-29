import * as io from 'io-ts';

export const CreateCatDto = io.type({
  name: io.string,
  dateOfBirth: io.string,
  breed: io.string,
});

export type CreateCatDto = io.TypeOf<typeof CreateCatDto>;
