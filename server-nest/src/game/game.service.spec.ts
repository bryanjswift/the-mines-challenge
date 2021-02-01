import SQL from '@nearform/sql';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { NoRecordError } from '../errors';
import { getClient } from '../vendor/db';
import { GameMoveDto } from './game.dto';
import { Game } from './game.model';
import { GameService } from './game.service';
import { GameMoveType } from './game-move.model';

beforeEach(() => {
  const client = getClient();
  return client
    .connect()
    .then(() => client.query(SQL`TRUNCATE game CASCADE`))
    .finally(() => client.end());
});

afterEach(() => {
  const client = getClient();
  return client
    .connect()
    .then(() => client.query(SQL`TRUNCATE game CASCADE`))
    .finally(() => client.end());
});

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#create', () => {
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
  });

  describe('#list', () => {
    it('is empty', async () => {
      const result = await service.list();
      expect(result).toHaveLength(0);
    });

    it('has contents after create', async () => {
      const game = await service.create({
        rows: 2,
        columns: 2,
      });
      const result = await service.list();
      expect(result).toHaveLength(1);
      expect(result.map((g) => g.id)).toContain(game.id);
    });
  });

  describe('#findById', () => {
    let game: Game;

    beforeEach(async () => {
      game = await service.create({
        rows: 2,
        columns: 2,
      });
    });

    it('is undefined for unknown id', async () => {
      const result = await service.findById(uuid());
      expect(result).toBeUndefined();
    });

    it('finds an existing game', async () => {
      const result = await service.findById(game.id);
      expect(result).toEqual(game);
    });
  });

  describe('#addMoveById', () => {
    const moveTypes = [GameMoveType.FLAG, GameMoveType.OPEN];
    let game: Game;

    beforeEach(async () => {
      game = await service.create({
        rows: 2,
        columns: 2,
      });
    });

    for (let i = 0; i < moveTypes.length; i++) {
      const moveType = moveTypes[i];
      describe(moveType, () => {
        const move: GameMoveDto = { column: 0, type: moveType, row: 0 };

        it('throws for unknown id', () => {
          expect(
            async () => await service.addMoveById(uuid(), move)
          ).rejects.toThrow(NoRecordError);
        });

        it('returns a new game', async () => {
          const result = await service.addMoveById(game.id, move);
          expect(result).not.toEqual(game);
        });

        it('returns a game with a new board state', async () => {
          const result = await service.addMoveById(game.id, move);
          expect(result.board).not.toEqual(game.board);
        });

        it('returns a game with same id', async () => {
          const result = await service.addMoveById(game.id, move);
          expect(result).toHaveProperty('id', game.id);
        });

        it('replaces the old game', async () => {
          const result = await service.addMoveById(game.id, move);
          expect(service.findById(game.id)).resolves.toEqual(result);
        });
      });
    }

    it('flags a cell', async () => {
      const result = await service.addMoveById(game.id, {
        column: 0,
        row: 0,
        type: GameMoveType.FLAG,
      });
      expect(result.board[0]).toBe('F');
    });

    it('opens a cell', async () => {
      const result = await service.addMoveById(game.id, {
        column: 0,
        row: 0,
        type: GameMoveType.OPEN,
      });
      expect(result.board[0]).not.toEqual(game.board[0]);
    });
  });
});
