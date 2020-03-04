import { Cell } from './cell.model';

describe(Cell, () => {
  describe('not a mine', () => {
    describe('no neighbors', () => {
      let model: Cell;

      beforeAll(() => {
        model = new Cell();
      });

      it('is not a mine', () => {
        expect(model.isMine).toBe(false);
      });

      it('has an empty mineCount', () => {
        expect(model.mineCount).toBe(0);
      });

      it('is a border', () => {
        expect(model.isBorder).toBe(true);
      });
    });

    describe('right neighbor', () => {
      const neighbor = new Cell({ isMine: true });
      let model: Cell;

      beforeAll(() => {
        model = new Cell();
        model.add('right', neighbor);
      });

      it('is not a mine', () => {
        expect(model.isMine).toBe(false);
      });

      it('has an empty mineCount', () => {
        expect(model.mineCount).toBe(1);
      });

      it('is a border', () => {
        expect(model.isBorder).toBe(true);
      });
    });
  });
});
