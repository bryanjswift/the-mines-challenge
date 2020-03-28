import { Test, TestingModule } from '@nestjs/testing';
import { NoRecordError } from '../errors';
import { GamesResolver } from './game.resolver';
import { GameService } from './game.service';
import { OutOfBoundsException } from './out-of-bounds.exception';

describe(GamesResolver, () => {
  let resolver: GamesResolver;
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [GamesResolver, GameService],
    }).compile();

    resolver = module.get<GamesResolver>(GamesResolver);
    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('#createGame', () => {
    it('creates a game', () => {
      const result = resolver.createGame({ rows: 3, columns: 3 });
      expect(result).toBeDefined();
    });

    it('returns an id', () => {
      const result = resolver.createGame({ rows: 3, columns: 3 });
      expect(result.id).toBeDefined();
    });

    it('returns instance with id, board, status', () => {
      const result = resolver.createGame({ rows: 3, columns: 3 });
      expect(Object.keys(result)).toEqual(['board', 'id', 'status']);
    });
  });

  describe('#games', () => {
    it('is an empty list', () => {
      expect(resolver.games()).toHaveLength(0);
    });

    it('lists one after create', () => {
      resolver.createGame({ rows: 3, columns: 3 });
      expect(resolver.games()).toHaveLength(1);
    });

    it('lists whole games', () => {
      const game = resolver.createGame({ rows: 3, columns: 3 });
      const result = resolver.games();
      expect(result).toContainEqual(game);
    });
  });

  describe('#getGame', () => {
    it('returns undefined for non-existing id', () => {
      expect(resolver.getGame('foo')).toBeUndefined();
    });

    it('serializes a Game', () => {
      const { id } = resolver.createGame({ rows: 10, columns: 10 });
      const game = service.findById(id);
      const result = resolver.getGame(id);
      expect(result).toHaveProperty('id', id);
      expect(result.board.flat()).toEqual(game.board);
      expect(result).toHaveProperty('status');
    });
  });

  describe('gameAddMove', () => {
    const alpha = { column: 0, row: 0 };

    it('throws NoRecordError for non-existing id', () => {
      expect(() => resolver.gameAddMove({ id: 'foo', ...alpha })).toThrowError(
        NoRecordError
      );
    });

    it('throws OutOfBoundsException for out of bounds row', () => {
      const { id } = resolver.createGame({ rows: 10, columns: 10 });
      expect(() =>
        resolver.gameAddMove({ id, column: 11, row: 0 })
      ).toThrowError(OutOfBoundsException);
    });

    it('throws OutOfBoundsException for out of bounds column', () => {
      const { id } = resolver.createGame({ rows: 10, columns: 10 });
      expect(() =>
        resolver.gameAddMove({ id, column: 0, row: 11 })
      ).toThrowError(OutOfBoundsException);
    });

    it('updates a Game', () => {
      const { id } = resolver.createGame({ rows: 10, columns: 10 });
      const result = resolver.gameAddMove({ id, ...alpha });
      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('board');
      expect(result).toHaveProperty('status');
    });
  });
});

