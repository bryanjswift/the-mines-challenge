import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { NoRecordError } from '../errors';
import { Game } from './game.model';
import { GameService } from './game.service';

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
    it('creates a game instance', () => {
      const result = service.create({
        rows: 2,
        columns: 2,
      });
      expect(result).toBeInstanceOf(Game);
    });

    it('creates a game instance with expected cells', () => {
      const result = service.create({
        rows: 2,
        columns: 2,
      });
      expect(result.cells).toHaveLength(4);
    });
  });

  describe('#list', () => {
    it('is empty', () => {
      const result = service.list();
      expect(result).toHaveLength(0);
    });

    it('has contents after create', () => {
      const game = service.create({
        rows: 2,
        columns: 2,
      });
      const result = service.list();
      expect(result).toHaveLength(1);
      expect(result).toContain(game);
    });
  });

  describe('#findById', () => {
    let game: Game;

    beforeEach(() => {
      game = service.create({
        rows: 2,
        columns: 2,
      });
    });

    it('is undefined for unknown id', () => {
      const result = service.findById(uuid());
      expect(result).toBeUndefined();
    });

    it('finds the an existing game', () => {
      const result = service.findById(game.id);
      expect(result).toBe(game);
    });
  });

  describe('#updateById', () => {
    let game: Game;

    beforeEach(() => {
      game = service.create({
        rows: 2,
        columns: 2,
      });
    });

    it('throws for unknown id', () => {
      expect(() => service.updateById(uuid(), null)).toThrow(NoRecordError);
    });

    it('throws if ids do not match', () => {
      const g2 = service.create({ rows: 2, columns: 2 });
      expect(() => service.updateById(g2.id, game)).toThrow();
    });

    it('returns the old game', () => {
      const v2 = game.openCoordinates(0, 0);
      const result = service.updateById(game.id, v2);
      expect(result).toBe(game);
    });

    it('replaces the old game', () => {
      const v2 = game.openCoordinates(0, 0);
      service.updateById(game.id, v2);
      expect(service.findById(game.id)).toBe(v2);
    });
  });

  describe('#addMoveById', () => {
    let game: Game;

    beforeEach(() => {
      game = service.create({
        rows: 2,
        columns: 2,
      });
    });

    it('throws for unknown id', () => {
      expect(() => service.addMoveById(uuid(), 0, 0)).toThrow(NoRecordError);
    });

    it('returns a new game', () => {
      const result = service.addMoveById(game.id, 0, 0);
      expect(result).not.toBe(game);
    });

    it('returns a game with a new board state', () => {
      const result = service.addMoveById(game.id, 0, 0);
      expect(result.board).not.toEqual(game.board);
    });

    it('returns a game with same id', () => {
      const result = service.addMoveById(game.id, 0, 0);
      expect(result).toHaveProperty('id', game.id);
    });

    it('replaces the old game', () => {
      const result = service.addMoveById(game.id, 0, 0);
      expect(service.findById(game.id)).toBe(result);
    });
  });
});
