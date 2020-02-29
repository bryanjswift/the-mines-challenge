import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { Cat } from './cat.model';

const DEFAULT_CAT: Omit<Cat, 'id'> = {
  name: 'Oscar',
  dateOfBirth: new Date().toISOString(),
  breed: 'Unknown',
};

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

  findAll(): Cat[] {
    return this.cats;
  }

  findById(id: string): Cat {
    return this.cats.find(cat => cat.id === id);
  }
}
