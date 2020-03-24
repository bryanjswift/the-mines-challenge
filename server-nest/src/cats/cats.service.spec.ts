import { date, name, random } from 'faker';
import { ulid } from 'ulid';
import { Cat } from './cat.model';
import { CatsService } from './cats.service';

describe(CatsService, () => {
  let service: CatsService;

  beforeEach(() => {
    service = new CatsService();
  });

  describe('#create', () => {
    it('creates an empty cat', () => {
      const result = service.create({
        name: undefined,
        breed: undefined,
        dateOfBirth: undefined,
      });
      expect(result).toBeDefined();
    });

    it('creates a cat with an id', () => {
      const result = service.create({
        name: undefined,
        breed: undefined,
        dateOfBirth: undefined,
      });
      expect(result.id).toBeDefined();
    });

    it('creates an empty cat with matching data', () => {
      const input = {
        name: undefined,
        breed: undefined,
        dateOfBirth: undefined,
      };
      const result = service.create(input);
      expect(result.name).toEqual(input.name);
      expect(result.breed).toEqual(input.breed);
      expect(result.dateOfBirth).toEqual(input.dateOfBirth);
    });

    it('creates a cat with matching data', () => {
      const input = {
        name: name.firstName(),
        breed: random.word(),
        dateOfBirth: date.past().toISOString(),
      };
      const result = service.create(input);
      expect(result.name).toEqual(input.name);
      expect(result.breed).toEqual(input.breed);
      expect(result.dateOfBirth).toEqual(input.dateOfBirth);
    });
  });

  describe('#list', () => {
    it('is empty', () => {
      const result = service.list();
      expect(result).toHaveLength(0);
    });

    it('has contents after create', () => {
      const cat = service.create({
        name: name.firstName(),
        breed: random.word(),
        dateOfBirth: date.past().toISOString(),
      });
      const result = service.list();
      expect(result).toHaveLength(1);
      expect(result).toContain(cat);
    });
  });

  describe('#findById', () => {
    let cat: Cat;

    beforeEach(() => {
      cat = service.create({
        name: name.firstName(),
        breed: random.word(),
        dateOfBirth: date.past().toISOString(),
      });
    });

    it('is undefined for unknown id', () => {
      const result = service.findById(ulid());
      expect(result).toBeUndefined();
    });

    it('finds the an existing game', () => {
      const result = service.findById(cat.id);
      expect(result).toBe(cat);
    });
  });
});
