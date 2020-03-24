import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';

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
      expect(result).toHaveProperty('board', game.board);
      expect(result).toHaveProperty('status');
    });
  });

  describe('PATCH /:id', () => {
    const alpha = { x: 0, y: 0 };

    it('throws NotFoundException for non-existing id', () => {
      expect(() => controller.addMove('foo', alpha)).toThrowError(
        NotFoundException
      );
    });

    it('throws UnprocessableEntityException for out of bounds row', () => {
      const { id } = controller.create({ rows: 10, columns: 10 });
      expect(() => controller.addMove(id, { x: 11, y: 0 })).toThrowError(
        UnprocessableEntityException
      );
    });

    it('throws UnprocessableEntityException for out of bounds column', () => {
      const { id } = controller.create({ rows: 10, columns: 10 });
      expect(() => controller.addMove(id, { x: 0, y: 11 })).toThrowError(
        UnprocessableEntityException
      );
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
