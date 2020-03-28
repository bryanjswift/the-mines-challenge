import {
  Body,
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
import { NoRecordError } from '../errors';
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
  create(@Body() data: CreateGameDto): Pick<Game, 'id'> {
    const game = this.gameService.create(data);
    return { id: game.id };
  }

  @Get()
  @Header('Cache-Control', 'max-age=60')
  findAll(): GameId[] {
    return this.gameService.list().map((game) => game.id);
  }

  @Get(':id')
  @Header('Cache-Control', 'must-revalidate, max-age=60')
  findOne(@Param('id') id: GameId): GameView {
    const game = this.gameService.findById(id);
    if (typeof game === 'undefined' || game === null) {
      throw new NotFoundException();
    }
    return serializeGame(game);
  }

  @Patch(':id')
  @UsePipes(new IoValidationPipe(GameMoveDto))
  addMove(@Param('id') id: GameId, @Body() move: GameMoveDto): GameView {
    try {
      const next = this.gameService.addMoveById(id, move.x, move.y);
      return serializeGame(next);
    } catch (error) {
      if (error instanceof NoRecordError) {
        throw new NotFoundException();
      } else {
        throw new UnprocessableEntityException(
          'Coordinates out of range.',
          'invalid_coordinates'
        );
      }
    }
  }
}
