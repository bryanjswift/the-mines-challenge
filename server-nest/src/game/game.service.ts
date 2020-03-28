import { Injectable } from '@nestjs/common';
import { NoRecordError } from '../errors';
import { Game, GameId, Props } from './game.model';

@Injectable()
export class GameService {
  private readonly games: Game[] = [];

  /**
   * Create a new record and store it.
   * @param data to be stored.
   * @returns the stored Game record.
   */
  create(data: Omit<Props, 'id'>): Game {
    const game: Game = new Game(data);
    this.games.push(game);
    return game;
  }

  /**
   * List all stored Game records.
   * @returns all records.
   */
  list(): Game[] {
    return this.games;
  }

  /**
   * Find a record matching the given `id`.
   * @param id of the record to find.
   * @returns the record if one is found or `undefined` if one is not.
   */
  findById(id: GameId): Game {
    return this.games.find((game) => game.id === id);
  }

  /**
   * Replace the game with the given `id` with the given `game`.
   * @param id of the record to replace.
   * @param game to replace the existing `Game`.
   * @returns the removed `Game` instance.
   * @throws if `id` does not exist.
   * @throws if `id` does not match `game.id`.
   */
  updateById(id: GameId, game: Game): Game {
    const gameIndex = this.games.findIndex((game) => game.id === id);
    if (gameIndex === -1) {
      throw new NoRecordError(id, 'Game');
    } else if (id !== game.id) {
      throw new Error(
        'Can only update a Game with a new version of the same Game.'
      );
    }
    // replace game with same id
    const replaced = this.games.splice(gameIndex, 1, game);
    return replaced[0];
  }
}
