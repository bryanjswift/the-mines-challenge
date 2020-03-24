import * as io from 'io-ts';

/**
 * Represent the request body for creating a game instance as a runtime
 * verifiable type.
 */
export const CreateGameDto = io.type({
  rows: io.number,
  columns: io.number,
});

export type CreateGameDto = io.TypeOf<typeof CreateGameDto>;
