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

/**
 * Represent the request body for opening a game cell as a runtime verifiable
 * type.
 */
export const GameMoveDto = io.type({
  x: io.number,
  y: io.number,
});

export type GameMoveDto = io.TypeOf<typeof GameMoveDto>;
