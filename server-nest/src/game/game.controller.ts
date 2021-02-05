import {
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnprocessableEntityException,
  UsePipes,
} from '@nestjs/common';
import { GameCompleteError, NoRecordError } from '../errors';
import { IoValidationPipe } from '../io-validation.pipe';
import { CreateGameDto, GameMoveDto } from './game.dto';
import { Game, GameId } from './game.model';
import { GameService } from './game.service';
import { GameView, serializeGame } from './game.view';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new IoValidationPipe(CreateGameDto))
  async create(@Body() data: CreateGameDto): Promise<Pick<Game, 'id'>> {
    const game = await this.gameService.create(data);
    return { id: game.id };
  }

  @Get()
  @Header('Cache-Control', 'max-age=60')
  async findAll(): Promise<GameId[]> {
    const games = await this.gameService.list();
    return games.map((game) => game.id);
  }

  @Get(':id')
  @Header('Cache-Control', 'must-revalidate, max-age=60')
  async findOne(@Param('id') id: GameId): Promise<GameView> {
    const game = await this.gameService.findById(id);
    if (typeof game === 'undefined' || game === null) {
      throw new NotFoundException();
    }
    return serializeGame(game);
  }

  @Patch(':id')
  @UsePipes(new IoValidationPipe(GameMoveDto))
  async addMove(
    @Param('id') id: GameId,
    @Body() move: GameMoveDto
  ): Promise<GameView> {
    try {
      const next = await this.gameService.addMoveById(id, move);
      return serializeGame(next);
    } catch (error) {
      if (error instanceof NoRecordError) {
        throw new NotFoundException();
      } else if (error instanceof GameCompleteError) {
        throw new ConflictException({
          statusCode: 409,
          message: error.message,
        });
      } else {
        throw new UnprocessableEntityException(
          'Coordinates out of range.',
          'invalid_coordinates'
        );
      }
    }
  }
}
