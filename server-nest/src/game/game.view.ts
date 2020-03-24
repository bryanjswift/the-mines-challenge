import { Game } from './game.model';

type Status = 'WON' | 'LOST' | 'OPEN';

export interface GameView {
  board: Game['board'];
  id: Game['id'];
  status: Status;
}

export function serializeGame(game: Game): GameView {
  return {
    board: game.board,
    id: game.id,
    status: game.gameStatus,
  };
}
