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
import { IoValidationPipe } from '../io-validation.pipe';
import { CreateGameDto, GameMoveDto } from './game.dto';
import { Game } from './game.model';
import { GameService } from './game.service';
import { GameView, serializeGame } from './game.view';

type GameId = Game['id'];

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
  findOne(@Param('id') id: string): GameView {
    const game = this.gameService.findById(id);
    if (typeof game === 'undefined' || game === null) {
      throw new NotFoundException();
    }
    return serializeGame(game);
  }

  @Patch(':id')
  @UsePipes(new IoValidationPipe(GameMoveDto))
  addMove(@Param('id') id: string, @Body() move: GameMoveDto): GameView {
    const current = this.gameService.findById(id);
    if (typeof current === 'undefined' || current === null) {
      throw new NotFoundException();
    }
    try {
      const next = current.openCoordinates(move.x, move.y);
      this.gameService.updateById(current.id, next);
      return serializeGame(next);
    } catch (e) {
      throw new UnprocessableEntityException(
        'Coordinates out of range.',
        'invalid_coordinates'
      );
    }
  }
}
