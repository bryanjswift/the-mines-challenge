import { Game } from '../game/game.model';

export class GameCompleteError extends Error {
  /**
   * Indicates the given Game has already been completed, no new moves will be
   * accepted.
   * @param game of the record which could not be found.
   */
  constructor(private readonly game: Game) {
    super();
  }

  get message(): string {
    return `Game(id: "${this.game.id}") is already ${this.game.gameStatus}.`;
  }
}
