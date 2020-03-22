import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Cat } from './cat.model';
import { CreateCatInput } from './cats.dto';
import { CatsService } from './cats.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Resolver((of) => Cat)
export class CatsResolver {
  constructor(private readonly catsService: CatsService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => [Cat])
  async list(): Promise<Cat[]> {
    return this.catsService.list();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => Cat, { nullable: true })
  getCat(@Args('id') id: string): Cat {
    return this.catsService.findById(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation((returns) => Cat)
  createCat(@Args('data') data: CreateCatInput): Cat {
    return this.catsService.create(data);
  }
}
