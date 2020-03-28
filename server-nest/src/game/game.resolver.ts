import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GameViewModel, serializeGame } from './game.view';
import { CreateGameInput, CreateGameMoveInput } from './game.dto';
import { GameService } from './game.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Resolver((of) => GameViewModel)
export class GamesResolver {
  constructor(private readonly gameService: GameService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => [GameViewModel])
  games(): GameViewModel[] {
    return this.gameService.list().map(serializeGame);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => GameViewModel, { nullable: true })
  getGame(@Args('id') id: string): GameViewModel {
    const model = this.gameService.findById(id);
    if (model) {
      return serializeGame(model);
    } else {
      return undefined;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation((returns) => GameViewModel)
  createGame(@Args('data') data: CreateGameInput): GameViewModel {
    const model = this.gameService.create(data);
    return serializeGame(model);
  }

  @Mutation((returns) => GameViewModel)
  gameAddMove(@Args('data') data: CreateGameMoveInput): GameViewModel {
    const next = this.gameService.addMoveById(data.id, data.column, data.row);
    return serializeGame(next);
  }
}
