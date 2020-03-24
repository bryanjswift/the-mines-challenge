import { Game, GameStatus } from './game.model';

type Status = 'won' | 'lost' | 'open';

export interface GameView {
  board: Game['board'];
  id: Game['id'];
  status: Status;
}

export function serializeGame(game: Game): GameView {
  let status: Status;
  switch (game.gameStatus) {
    case GameStatus.OPEN:
      status = 'open';
      break;
    case GameStatus.LOST:
      status = 'lost';
      break;
    case GameStatus.WON:
      status = 'won';
      break;
  }
  return {
    board: game.board,
    id: game.id,
    status,
  };
}
