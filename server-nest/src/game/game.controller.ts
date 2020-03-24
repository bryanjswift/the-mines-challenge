import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { IoValidationPipe } from '../io-validation.pipe';
import { CreateGameDto } from './game.dto';
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
}
