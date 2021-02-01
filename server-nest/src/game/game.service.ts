import SQL from '@nearform/sql';
import { Injectable } from '@nestjs/common';
import { NoRecordError } from '../errors';
import { getClient } from '../vendor/db';
import { Cell } from './cell.model';
import { GameMoveDto } from './game.dto';
import { Game, GameId, Props } from './game.model';
import { GameMoveType } from './game-move.model';

export interface BaseGameService {
  /**
   * Find the `Game` associated with `id`, add the move represented by the
   * column and row to be opened, return the updated `Game`.
   * @param id of the record to update.
   * @param move containing details about the cell to interact.
   * @returns a `Game` with the move applied.
   * @throws if `id` does not exist.
   * @throws if `(column, row)` can not be changed.
   */
  addMoveById(id: GameId, move: GameMoveDto): Promise<Game>;

  /**
   * Create a new record and store it.
   * @param data to be stored.
   * @returns the stored Game record.
   */
  create(data: Omit<Props, 'id'>): Promise<Game>;

  /**
   * List all stored Game records.
   * @returns all records.
   */
  list(): Promise<Game[]>;

  /**
   * Find a record matching the given `id`.
   * @param id of the record to find.
   * @returns the record if one is found or `undefined` if one is not.
   */
  findById(id: GameId): Promise<Game | undefined>;
}

@Injectable()
export class GameService implements BaseGameService {
  /**
   * Find the `Game` associated with `id`, add the move represented by the
   * column and row to be opened, return the updated `Game`.
   * @param id of the record to update.
   * @param move containing details about the cell to interact.
   * @returns a `Game` with the move applied.
   * @throws if `id` does not exist.
   * @throws if `(column, row)` can not be changed.
   */
  async addMoveById(id: GameId, move: GameMoveDto): Promise<Game> {
    const current = await this.findById(id);
    if (typeof current === 'undefined' || current === null) {
      throw new NoRecordError(id, 'Game');
    }
    const { column, row } = move;
    const cell = current.findCell(column, row);
    const client = getClient();
    try {
      await client.connect();
      await client.query(SQL`BEGIN`);
      const moveIds = await client.query<{ move_id: string }>(SQL`
        INSERT
        INTO game_move (cell_id, game_id, move_type)
        VALUES (${cell.id}, ${current.id}, ${move.type})
        RETURNING move_id
      `);
      if (moveIds.rowCount !== 1) {
        throw new Error(
          `Wrong number of records when inserting move: ${moveIds.rowCount}`
        );
      }
      await client.query(SQL`COMMIT`);
    } catch (error) {
      await client.query(SQL`ROLLBACK`);
      // Rethrow whatever error caused the rollback
      throw error;
    } finally {
      await client.end();
    }
    let next: Game;
    switch (move.type) {
      case GameMoveType.FLAG:
        next = current.flagCoordinates(column, row);
        break;
      case GameMoveType.OPEN:
        next = current.openCoordinates(column, row);
        break;
    }
    return next;
  }

  /**
   * Create a new record and store it.
   * @param data to be stored.
   * @returns the stored Game record.
   */
  async create(data: Omit<Props, 'id'>): Promise<Game> {
    const game: Game = new Game(data);
    const client = getClient();
    try {
      await client.connect();
      await client.query(SQL`BEGIN`);
      const gameIds = await client.query<Pick<GameRecord, 'id'>>(SQL`
        INSERT
        INTO game (game_id, column_count, row_count)
        VALUES (${game.id}, ${data.columns}, ${data.rows})
        RETURNING game_id AS id
      `);
      if (gameIds.rowCount !== 1) {
        throw new Error(
          `Wrong number of records when inserting Game: ${gameIds.rowCount}`
        );
      } else if (gameIds.rows[0].id !== game.id) {
        throw new Error(
          `Game created with a different. Actual: ${gameIds.rows[0].id} Expected: ${game.id}`
        );
      }
      const cellInsertRaw = `
        INSERT
        INTO game_cell (game_id, cell_id, is_mine, game_sequence_id)
        VALUES ${game.cells.map(
          (_, index) =>
            `($${4 * index + 1}, $${4 * index + 2}, $${4 * index + 3}, $${
              4 * index + 4
            })`
        )}
        RETURNING cell_id AS id, is_mine
      `;
      const cellIds = await client.query<GameCellRecord>({
        text: cellInsertRaw,
        values: game.cells.flatMap((cell, index) => [
          game.id,
          cell.id,
          cell.isMine,
          index,
        ]),
      });
      if (cellIds.rowCount !== game.cells.length) {
        throw new Error(
          `Wrong number of cells created when inserting Game. Actual: ${cellIds.rowCount} Expected: ${game.cells.length}`
        );
      }
      await client.query(SQL`COMMIT`);
    } catch (error) {
      await client.query(SQL`ROLLBACK`);
      // Rethrow whatever error caused the rollback
      throw error;
    } finally {
      await client.end();
    }
    return game;
  }

  /**
   * List all stored Game records.
   * @returns all records.
   */
  async list(): Promise<Game[]> {
    const client = getClient();
    try {
      await client.connect();
      const gameData = await client.query<GameRecord>(SQL`
        SELECT
          game.game_id AS id,
          game.column_count AS columns,
          game.row_count AS rows,
          coalesce(game_moves.moves, json_build_array()) AS moves,
          coalesce(game_cells.cells, json_build_array()) AS cells
        FROM game
          JOIN game_cells ON game.game_id = game_cells.game_id
          LEFT JOIN game_moves ON game.game_id = game_moves.game_id
      `);
      return gameData.rows.map(
        (row) =>
          new Game({
            id: row.id,
            columns: row.columns,
            rows: row.rows,
            cells: row.cells.map(
              (r) => new Cell({ id: r.id, isMine: r.is_mine })
            ),
            moves: row.moves.map((r) => ({
              cellId: r.cell_id,
              type: r.move_type,
            })),
          })
      );
    } catch (error) {
      throw error;
    } finally {
      await client.end();
    }
  }

  /**
   * Find a record matching the given `id`.
   * @param id of the record to find.
   * @returns the record if one is found or `undefined` if one is not.
   */
  async findById(id: GameId): Promise<Game | undefined> {
    const client = getClient();
    try {
      await client.connect();
      const gameData = await client.query<GameRecord>(SQL`
        SELECT
          game.game_id AS id,
          game.column_count AS columns,
          game.row_count AS rows,
          coalesce(game_moves.moves, json_build_array()) AS moves,
          coalesce(game_cells.cells, json_build_array()) AS cells
        FROM game
          JOIN game_cells ON game.game_id = game_cells.game_id
          LEFT JOIN game_moves ON game.game_id = game_moves.game_id
        WHERE game.game_id = ${id}
      `);
      if (gameData.rowCount === 0) {
        return undefined;
      } else if (gameData.rowCount > 1) {
        throw new Error(`Found multiple records with game_id: ${id}`);
      }
      const games = gameData.rows.map(
        (row) =>
          new Game({
            id: row.id,
            columns: row.columns,
            rows: row.rows,
            cells: row.cells.map(
              (r) => new Cell({ id: r.id, isMine: r.is_mine })
            ),
            moves: row.moves.map((r) => ({
              cellId: r.cell_id,
              type: r.move_type,
            })),
          })
      );
      return games.pop();
    } catch (error) {
      // Whatever error happened means we didn't find a record.
      // TODO: Log the error
      return undefined;
    } finally {
      await client.end();
    }
  }
}

type GameRecord = {
  id: string;
  columns: number;
  rows: number;
  cells: GameCellRecord[];
  moves: GameMoveRecord[];
};

type GameCellRecord = {
  is_mine: boolean;
  id: string;
};

type GameMoveRecord = {
  cell_id: string;
  move_type: GameMoveType;
};
