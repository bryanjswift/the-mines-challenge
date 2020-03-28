import { Game, GameId } from './game.model';

type Status = 'WON' | 'LOST' | 'OPEN';

export interface GameView {
  board: string[][];
  id: GameId;
  status: Status;
}

export function serializeGame(game: Game): GameView {
  const board = game.board.reduce(
    (memo, view) => {
      const row = memo.slice(-1)[0];
      if (row.length >= game.columns) {
        return [
          ...memo,
          [view],
        ];
      } else {
        return [
          ...memo.slice(0, -1),
          [
            ...row,
            view,
          ]
        ];
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
