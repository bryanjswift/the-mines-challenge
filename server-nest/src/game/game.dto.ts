import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import * as io from 'io-ts';
import { GameId } from './game.model';
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

// #region GraphQL
registerEnumType(GameMoveType, {
  name: 'GameMoveType',
});

/**
 * Represents the input data necessary to create a new `Game`.
 */
@InputType()
export class CreateGameInput {
  /** How many rows the new `Game` will have. */
  @Field()
  rows: number;
  /** How many columns the new `Game` will have. */
  @Field()
  columns: number;
}

/**
 * Represents the input data necessary to add a move to an existing `Game`.
 */
@InputType()
export class CreateGameMoveInput {
  /** Unique identifier for the `Game`. */
  @Field()
  id: GameId;
  /** Column of the cell to act upon. */
  @Field()
  column: number;
  /** Row of the cell to act upon. */
  @Field()
  row: number;
  /** The type of move to create for the game with given id. */
  @Field()
  type: GameMoveType;
}
// #endregion GraphQL
