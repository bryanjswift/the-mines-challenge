import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Game, GameId, GameStatus } from './game.model';

export interface GameView {
  board: string[][];
  id: GameId;
  status: GameStatus;
}

export function serializeGame(game: Game): GameView {
  const board = game.board.reduce(
    (memo, view) => {
      const row = memo.slice(-1)[0];
      if (row.length >= game.columns) {
        return [...memo, [view]];
      } else {
        return [...memo.slice(0, -1), [...row, view]];
      }
    },
    [[]]
  );
  return {
    board,
    id: game.id,
    status: game.gameStatus,
  };
}

// #region GraphQL
registerEnumType(GameStatus, {
  name: 'GameStatus',
});

/**
 * Domain model reprsentation of a game board.
 */
@ObjectType()
export class GameViewModel implements GameView {
  /** Unique identifier for this cat. */
  @Field()
  id: GameId;
  /** Name for this cat. */
  @Field((_type) => [[String!]!])
  board: string[][];
  /** Breed of this cat. */
  @Field()
  status: GameStatus;
}
// #endregion GraphQL
