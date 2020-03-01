import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { Cat } from './cat.model';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(data: Omit<Cat, 'id'>): Cat {
    const cat: Cat = {
      id: ulid(),
      ...data,
    };
    this.cats.push(cat);
    return cat;
  }

  list(): Cat[] {
    return this.cats;
  }

  findById(id: string): Cat {
    return this.cats.find(cat => cat.id === id);
  }
}
