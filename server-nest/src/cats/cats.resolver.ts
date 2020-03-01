import { Args, Query, Resolver } from '@nestjs/graphql';
import { Cat } from './cat.model';
import { CatsService } from './cats.service';

@Resolver(of => Cat)
export class CatsResolver {
  constructor(private readonly catsService: CatsService) {}

  @Query(returns => [Cat])
  async list(): Promise<Cat[]> {
    return this.catsService.list();
  }

  @Query(returns => Cat, { nullable: true })
  getCat(@Args('id') id: string) {
    return this.catsService.findById(id);
  }
}
