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
