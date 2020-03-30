import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameMoveDto } from './game.dto';
import { GameService } from './game.service';
import { GameMoveType } from './game-move.model';

describe(GameController, () => {
  let controller: GameController;
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [GameService],
    }).compile();

    controller = module.get<GameController>(GameController);
    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /', () => {
    it('creates a game', () => {
      const result = controller.create({ rows: 3, columns: 3 });
      expect(result).toBeDefined();
    });

    it('returns an id', () => {
      const result = controller.create({ rows: 3, columns: 3 });
      expect(result.id).toBeDefined();
    });

    it('only returns an id', () => {
      const result = controller.create({ rows: 3, columns: 3 });
      expect(Object.keys(result)).toEqual(['id']);
    });
  });

  describe('GET /', () => {
    it('is an empty list', () => {
      expect(controller.findAll()).toHaveLength(0);
    });

    it('lists one after create', () => {
      controller.create({ rows: 3, columns: 3 });
      expect(controller.findAll()).toHaveLength(1);
    });

    it('lists only ids', () => {
      const game = controller.create({ rows: 3, columns: 3 });
      const result = controller.findAll();
      expect(result).toContain(game.id);
    });
  });

  describe('GET /:id', () => {
    it('throws NotFoundException for non-existing id', () => {
      expect(() => controller.findOne('foo')).toThrowError(NotFoundException);
    });

    it('serializes a Game', () => {
      const { id } = controller.create({ rows: 10, columns: 10 });
      const game = service.findById(id);
      const result = controller.findOne(id);
      expect(result).toHaveProperty('id', id);
      expect(result.board.flat()).toEqual(game.board);
      expect(result).toHaveProperty('status');
    });
  });

  describe('PATCH /:id', () => {
    const alpha: GameMoveDto = { column: 0, type: GameMoveType.OPEN, row: 0 };
    const type = GameMoveType.OPEN;

    it('throws NotFoundException for non-existing id', () => {
      expect(() => controller.addMove('foo', alpha)).toThrowError(
        NotFoundException
      );
    });

    it('throws UnprocessableEntityException for out of bounds row', () => {
      const { id } = controller.create({ rows: 10, columns: 10 });
      expect(() =>
        controller.addMove(id, { column: 11, type, row: 0 })
      ).toThrowError(UnprocessableEntityException);
    });

    it('throws UnprocessableEntityException for out of bounds column', () => {
      const { id } = controller.create({ rows: 10, columns: 10 });
      expect(() =>
        controller.addMove(id, { column: 0, type, row: 11 })
      ).toThrowError(UnprocessableEntityException);
    });

    it('updates a Game', () => {
      const { id } = controller.create({ rows: 10, columns: 10 });
      const result = controller.addMove(id, alpha);
      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('board');
      expect(result).toHaveProperty('status');
    });
  });
});
