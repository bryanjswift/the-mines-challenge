import * as io from 'io-ts';
import { GameMoveType } from './game-move.model';

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
  column: io.number,
  row: io.number,
  type: io.keyof(GameMoveType),
});

export type GameMoveDto = io.TypeOf<typeof GameMoveDto>;
