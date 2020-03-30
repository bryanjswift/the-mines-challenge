import { Injectable } from '@nestjs/common';
import { NoRecordError } from '../errors';
import { GameMoveDto } from './game.dto';
import { Game, GameId, Props } from './game.model';
import { GameMoveType } from './game-move.model';

@Injectable()
export class GameService {
  private readonly games: Game[] = [];

  /**
   * Find the `Game` associated with `id`, add the move represented by the
   * column and row to be opened, return the updated `Game`.
   * @param id of the record to update.
   * @param column of the `Cell` to open.
   * @param row of the `Cell` to open.
   * @returns a `Game` with the move applied.
   * @throws if `id` does not exist.
   * @throws if `(column, row)` can not be opened.
   */
  addMoveById(id: GameId, move: GameMoveDto): Game {
    const current = this.findById(id);
    if (typeof current === 'undefined' || current === null) {
      throw new NoRecordError(id, 'Game');
    }
    const { column, row } = move;
    let next: Game;
    switch (move.type) {
      case GameMoveType.FLAG:
        next = current.flagCoordinates(column, row);
        break;
      case GameMoveType.OPEN:
        next = current.openCoordinates(column, row);
        break;
    }
    this.updateById(current.id, next);
    return next;
  }

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
