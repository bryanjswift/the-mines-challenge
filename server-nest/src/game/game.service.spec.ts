import { SqlStatement } from '@nearform/sql';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { GameCompleteError, NoRecordError } from '../errors';
import { Cell } from './cell.model';
import { GameMoveDto } from './game.dto';
import { Game } from './game.model';
import {
  GameService,
  GameCellRecord,
  GameMoveRecord,
  GameRecord,
} from './game.service';
import { GameMove, GameMoveType } from './game-move.model';

const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

const mockPool = {
  connect: async () => mockClient,
};

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: 'DB_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#create', () => {
    beforeEach(() => {
      mockClient.query
        .mockReset()
        // BEGIN
        .mockImplementationOnce(() => Promise.resolve())
        // INSERT INTO game
        .mockImplementationOnce((statement: SqlStatement) =>
          Promise.resolve({
            rowCount: 1,
            rows: [{ id: statement.values[0] }],
          })
        )
        // INSERT INTO game_cell
        .mockResolvedValueOnce({
          rowCount: 4,
          rows: [
            genGameCellRecord(),
            genGameCellRecord(),
            genGameCellRecord(),
            genGameCellRecord(),
          ],
        })
        // COMMIT
        .mockImplementationOnce(() => Promise.resolve());
    });

    it('creates a game instance', async () => {
      const result = await service.create({
        rows: 2,
        columns: 2,
      });
      expect(result).toBeInstanceOf(Game);
    });

    it('creates a game instance with expected cells', async () => {
      const result = await service.create({
        rows: 2,
        columns: 2,
      });
      expect(result.cells).toHaveLength(4);
    });

    it('rolls back when insert game fails', async () => {
      mockClient.query
        .mockReset()
        .mockReset()
        // BEGIN
        .mockImplementationOnce(() => Promise.resolve())
        // INSERT INTO game
        .mockImplementationOnce(() =>
          Promise.resolve({
            rowCount: 0,
            rows: [],
          })
        )
        // ROLLBACK
        .mockImplementationOnce(() => Promise.resolve());
      try {
        await service.create({
          rows: 2,
          columns: 2,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch(
          /^Wrong number of records when inserting Game/
        );
      }
      expect(mockClient.query).toHaveBeenLastCalledWith({
        strings: ['ROLLBACK'],
        values: [],
      });
    });

    it('rolls back when insert game generates new id', async () => {
      mockClient.query
        .mockReset()
        .mockReset()
        // BEGIN
        .mockImplementationOnce(() => Promise.resolve())
        // INSERT INTO game
        .mockImplementationOnce(() =>
          Promise.resolve({
            rowCount: 1,
            rows: [{ id: uuid() }],
          })
        )
        // ROLLBACK
        .mockImplementationOnce(() => Promise.resolve());
      try {
        await service.create({
          rows: 2,
          columns: 2,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch(/^Game created with a different id/);
      }
      expect(mockClient.query).toHaveBeenLastCalledWith({
        strings: ['ROLLBACK'],
        values: [],
      });
    });

    it('rolls back when insert game has too few cells', async () => {
      mockClient.query
        .mockReset()
        .mockReset()
        // BEGIN
        .mockImplementationOnce(() => Promise.resolve())
        // INSERT INTO game
        .mockImplementationOnce((statement: SqlStatement) =>
          Promise.resolve({
            rowCount: 1,
            rows: [{ id: statement.values[0] }],
          })
        )
        // INSERT INTO game_cell
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        })
        // ROLLBACK
        .mockImplementationOnce(() => Promise.resolve());
      try {
        await service.create({
          rows: 2,
          columns: 2,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch(
          /^Wrong number of cells created when inserting Game/
        );
      }
      expect(mockClient.query).toHaveBeenLastCalledWith({
        strings: ['ROLLBACK'],
        values: [],
      });
    });
  });

  describe('#list', () => {
    it('is empty', async () => {
      mockClient.query
        .mockReset()
        // SELECT FROM game
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        });
      const result = await service.list();
      expect(result).toHaveLength(0);
    });

    it('has contents after create', async () => {
      const game = new Game({ columns: 2, rows: 2 });
      mockClient.query
        .mockReset()
        // SELECT FROM game
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            genGameRecord({
              id: game.id,
              moves: [
                { cell_id: game.cells[0].id, move_type: GameMoveType.FLAG },
              ],
            }),
          ],
        });
      const result = await service.list();
      expect(result).toHaveLength(1);
      expect(result.map((g) => g.id)).toContain(game.id);
    });

    it('rethrows an error', async () => {
      mockClient.query
        .mockReset()
        // SELECT FROM game
        .mockRejectedValue(new Error('Fake Error'));
      try {
        await service.list();
        fail('Expected mock error to be thrown');
      } catch (error) {
        expect(error.message).toEqual('Fake Error');
      }
    });
  });

  describe('#findById', () => {
    it('is undefined for unknown id', async () => {
      mockClient.query
        .mockReset()
        // SELECT FROM game
        .mockResolvedValueOnce({
          rowCount: 0,
          rows: [],
        });
      const result = await service.findById(uuid());
      expect(result).toBeUndefined();
    });

    it('finds an existing game', async () => {
      const game = new Game({ columns: 2, rows: 2 });
      mockClient.query
        .mockReset()
        // SELECT FROM game
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [makeGameRecord(game)],
        });
      const result = await service.findById(game.id);
      expect(result).toEqual(game);
    });

    it('throws when single record not found', async () => {
      const game = new Game({ columns: 2, rows: 2 });
      mockClient.query
        .mockReset()
        // SELECT FROM game
        .mockResolvedValueOnce({
          rowCount: 2,
          rows: [makeGameRecord(game), makeGameRecord(game)],
        });
      try {
        await service.findById(game.id);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch(/^Found multiple records with game_id/);
      }
    });

    it('throws if the query throws', async () => {
      const game = new Game({ columns: 2, rows: 2 });
      mockClient.query
        .mockReset()
        // SELECT FROM game
        .mockRejectedValueOnce(new Error('Fake Error'));
      try {
        await service.findById(game.id);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toMatch('Fake Error');
      }
    });
  });

  describe('#addMoveById', () => {
    describe.each([GameMoveType.OPEN, GameMoveType.FLAG])('%s', (moveType) => {
      const move: GameMoveDto = { column: 0, type: moveType, row: 0 };

      it('throws for unknown id', async () => {
        mockClient.query
          .mockReset()
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
          });
        try {
          await service.addMoveById(uuid(), move);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(NoRecordError);
        }
      });

      it('throws with record error message', async () => {
        mockClient.query
          .mockReset()
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
          });
        try {
          await service.addMoveById(uuid(), move);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.message).toMatch(/does not exist.$/);
        }
      });

      it('returns a new game', async () => {
        const record = genGameRecord({ columns: 2, rows: 2 });
        mockClient.query
          .mockReset()
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 1,
            rows: [record],
          })
          // BEGIN
          .mockImplementationOnce(() => Promise.resolve())
          // INSERT INTO game_move
          .mockImplementationOnce(() =>
            Promise.resolve({
              rowCount: 1,
              rows: [{ move_id: uuid() }],
            })
          )
          // COMMIT
          .mockImplementationOnce(() => Promise.resolve());
        const result = await service.addMoveById(record.id, move);
        expect(result).not.toEqual(record);
      });

      it('returns a game with a new board state', async () => {
        const game = new Game({ columns: 2, rows: 2 });
        mockClient.query
          .mockReset()
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 1,
            rows: [makeGameRecord(game)],
          })
          // BEGIN
          .mockImplementationOnce(() => Promise.resolve())
          // INSERT INTO game_move
          .mockImplementationOnce(() =>
            Promise.resolve({
              rowCount: 1,
              rows: [{ move_id: uuid() }],
            })
          )
          // COMMIT
          .mockImplementationOnce(() => Promise.resolve());
        const result = await service.addMoveById(game.id, move);
        expect(result.board).not.toEqual(game.board);
      });

      it('returns a game with same id', async () => {
        const gameRecord = genGameRecord({ columns: 2, rows: 2 });
        mockClient.query
          .mockReset()
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 1,
            rows: [gameRecord],
          })
          // BEGIN
          .mockImplementationOnce(() => Promise.resolve())
          // INSERT INTO game_move
          .mockImplementationOnce(() =>
            Promise.resolve({
              rowCount: 1,
              rows: [{ move_id: uuid() }],
            })
          )
          // COMMIT
          .mockImplementationOnce(() => Promise.resolve());
        const result = await service.addMoveById(gameRecord.id, move);
        expect(result).toHaveProperty('id', gameRecord.id);
      });

      it('rolls back when game move not created', async () => {
        const gameRecord = genGameRecord({ columns: 2, rows: 2 });
        mockClient.query
          .mockReset()
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 1,
            rows: [gameRecord],
          })
          // BEGIN
          .mockImplementationOnce(() => Promise.resolve())
          // INSERT INTO game_move
          .mockImplementationOnce(() =>
            Promise.resolve({
              rowCount: 0,
              rows: [],
            })
          )
          // ROLLBACK
          .mockImplementationOnce(() => Promise.resolve());
        try {
          await service.addMoveById(gameRecord.id, move);
          fail('Should have thrown an error');
        } catch (error) {
          expect(error.message).toMatch(
            /^Wrong number of records when inserting move/
          );
        }
        expect(mockClient.query).toHaveBeenLastCalledWith({
          strings: ['ROLLBACK'],
          values: [],
        });
      });

      it('replaces the old game', async () => {
        const gameRecord = genGameRecord({ columns: 2, rows: 2 });
        mockClient.query
          .mockReset()
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 1,
            rows: [gameRecord],
          })
          // BEGIN
          .mockImplementationOnce(() => Promise.resolve())
          // INSERT INTO game_move
          .mockImplementationOnce(() =>
            Promise.resolve({
              rowCount: 1,
              rows: [{ move_id: uuid() }],
            })
          )
          // COMMIT
          .mockImplementationOnce(() => Promise.resolve())
          // SELECT FROM game (findById)
          .mockResolvedValueOnce({
            rowCount: 1,
            rows: [
              genGameRecord({
                ...gameRecord,
                moves: [
                  {
                    cell_id: gameRecord.cells.find((cell) => !cell.is_mine).id,
                    move_type: GameMoveType[move.type],
                  },
                ],
              }),
            ],
          });
        const result = await service.addMoveById(gameRecord.id, move);
        expect(service.findById(gameRecord.id)).resolves.toEqual(result);
      });

      describe('completed game', () => {
        it('throws when creating new move on completed game', async () => {
          const game = new Game({ columns: 2, rows: 2 });
          const gameRecord: GameRecord = {
            ...makeGameRecord(game),
            moves: game.cells.map((cell) => ({
              cell_id: cell.id,
              move_type: GameMoveType.OPEN,
            })),
          };
          mockClient.query
            .mockReset()
            // SELECT FROM game (findById)
            .mockResolvedValueOnce({
              rowCount: 1,
              rows: [gameRecord],
            });
          try {
            await service.addMoveById(game.id, move);
            fail('Should have thrown a GameCompleteError');
          } catch (error) {
            expect(error).toBeInstanceOf(GameCompleteError);
            expect(error.message).toMatch(/is already LOST.$/);
          }
        });
      });
    });

    it('flags a cell', async () => {
      const game = new Game({ columns: 2, rows: 2 });
      mockClient.query
        .mockReset()
        // SELECT FROM game (findById)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [makeGameRecord(game)],
        })
        // BEGIN
        .mockImplementationOnce(() => Promise.resolve())
        // INSERT INTO game_move
        .mockImplementationOnce(() =>
          Promise.resolve({
            rowCount: 1,
            rows: [{ move_id: uuid() }],
          })
        )
        // COMMIT
        .mockImplementationOnce(() => Promise.resolve());
      const result = await service.addMoveById(game.id, {
        column: 0,
        row: 0,
        type: GameMoveType.FLAG,
      });
      expect(result.board[0]).toBe('F');
    });

    it('opens a cell', async () => {
      const game = new Game({ columns: 2, rows: 2 });
      mockClient.query
        .mockReset()
        // SELECT FROM game (findById)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [makeGameRecord(game)],
        })
        // BEGIN
        .mockImplementationOnce(() => Promise.resolve())
        // INSERT INTO game_move
        .mockImplementationOnce(() =>
          Promise.resolve({
            rowCount: 1,
            rows: [{ move_id: uuid() }],
          })
        )
        // COMMIT
        .mockImplementationOnce(() => Promise.resolve());
      const result = await service.addMoveById(game.id, {
        column: 0,
        row: 0,
        type: GameMoveType.OPEN,
      });
      expect(result.board[0]).not.toEqual(game.board[0]);
    });
  });
});

const genGameCellRecord = (
  options?: Partial<GameCellRecord>
): GameCellRecord => ({
  id: uuid(),
  is_mine: options?.is_mine ?? false,
});

const genGameRecord = (options?: Partial<GameRecord>): GameRecord => {
  const columns = options?.columns ?? 2;
  const rows = options?.rows ?? 2;
  const cells =
    options?.cells ?? new Array(columns * rows).fill(genGameCellRecord());
  return {
    id: options?.id ?? uuid(),
    cells,
    columns,
    rows,
    moves: options?.moves ?? [],
  };
};

const makeGameCellRecord = (cell: Cell): GameCellRecord => ({
  id: cell.id,
  is_mine: cell.isMine,
});

const makeGameMoveRecord = (move: GameMove): GameMoveRecord => ({
  cell_id: move.cellId,
  move_type: move.type,
});

const makeGameRecord = (game: Game): GameRecord => ({
  id: game.id,
  cells: game.cells.map((c) => makeGameCellRecord(c)),
  columns: game.columns,
  moves: game.moves.map((m) => makeGameMoveRecord(m)),
  rows: game.rows,
});
