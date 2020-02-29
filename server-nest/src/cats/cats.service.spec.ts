import { date, name, random } from 'faker';
import { CatsService } from './cats.service';

describe(CatsService, () => {
  let service: CatsService;

  beforeAll(() => {
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
});
