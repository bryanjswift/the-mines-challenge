import { Args, Query, Resolver } from '@nestjs/graphql';
import { Cat } from './cat.model';
import { CatsService } from './cats.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Resolver(of => Cat)
export class CatsResolver {
  constructor(private readonly catsService: CatsService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [Cat])
  async list(): Promise<Cat[]> {
    return this.catsService.list();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => Cat, { nullable: true })
  getCat(@Args('id') id: string) {
    return this.catsService.findById(id);
  }
}
