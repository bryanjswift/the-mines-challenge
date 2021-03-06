import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { Cat } from './cat.model';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  /**
   * Create a new record and store it.
   * @param data to be stored.
   * @returns the stored cat record.
   */
  create(data: Omit<Cat, 'id'>): Cat {
    const cat: Cat = {
      id: ulid(),
      ...data,
    };
    this.cats.push(cat);
    return cat;
  }

  /**
   * List all stored cat records.
   * @returns all records.
   */
  list(): Cat[] {
    return this.cats;
  }

  /**
   * Find a record matching the given `id`.
   * @param id of the record to find.
   * @returns the record if one is found or `undefined` if one is not.
   */
  findById(id: string): Cat {
    return this.cats.find((cat) => cat.id === id);
  }
}
