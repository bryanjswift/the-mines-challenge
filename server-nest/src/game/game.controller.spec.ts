import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameMoveDto } from './game.dto';
import { BaseGameService, GameService } from './game.service';
import { MemGameService } from './game.mem-service';
import { GameMoveType } from './game-move.model';

describe(GameController, () => {
  let controller: GameController;
  let service: BaseGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useClass: MemGameService,
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /', () => {
    it('creates a game', async () => {
      const result = await controller.create({ rows: 3, columns: 3 });
      expect(result).toBeDefined();
    });

    it('returns an id', async () => {
      const result = await controller.create({ rows: 3, columns: 3 });
      expect(result.id).toBeDefined();
    });

    it('only returns an id', async () => {
      const result = await controller.create({ rows: 3, columns: 3 });
      expect(Object.keys(result)).toEqual(['id']);
    });
  });

  describe('GET /', () => {
    it('is an empty list', async () => {
      const result = await controller.findAll();
      expect(result).toHaveLength(0);
    });

    it('lists one after create', async () => {
      await controller.create({ rows: 3, columns: 3 });
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
    });

    it('lists only ids', async () => {
      const game = await controller.create({ rows: 3, columns: 3 });
      const result = await controller.findAll();
      expect(result).toContain(game.id);
    });
  });

  describe('GET /:id', () => {
    it('throws NotFoundException for non-existing id', () => {
      expect(() => controller.findOne('foo')).rejects.toThrowError(
        NotFoundException
      );
    });

    it('serializes a Game', async () => {
      const { id } = await controller.create({ rows: 10, columns: 10 });
      const game = await service.findById(id);
      const result = await controller.findOne(id);
      expect(result).toHaveProperty('id', id);
      expect(result.board.flat()).toEqual(game.board);
      expect(result).toHaveProperty('status');
    });
  });

  describe('PATCH /:id', () => {
    const alpha: GameMoveDto = { column: 0, type: GameMoveType.OPEN, row: 0 };
    const type = GameMoveType.OPEN;

    it('throws NotFoundException for non-existing id', () => {
      expect(() => controller.addMove('foo', alpha)).rejects.toThrowError(
        NotFoundException
      );
    });

    it('throws UnprocessableEntityException for out of bounds row', async () => {
      const { id } = await controller.create({ rows: 10, columns: 10 });
      expect(() =>
        controller.addMove(id, { column: 11, type, row: 0 })
      ).rejects.toThrowError(UnprocessableEntityException);
    });

    it('throws UnprocessableEntityException for out of bounds column', async () => {
      const { id } = await controller.create({ rows: 10, columns: 10 });
      expect(() =>
        controller.addMove(id, { column: 0, type, row: 11 })
      ).rejects.toThrowError(UnprocessableEntityException);
    });

    it('updates a Game', async () => {
      const { id } = await controller.create({ rows: 10, columns: 10 });
      const result = await controller.addMove(id, alpha);
      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('board');
      expect(result).toHaveProperty('status');
    });
  });
});
