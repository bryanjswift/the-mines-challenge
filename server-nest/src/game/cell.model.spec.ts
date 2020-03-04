import { Cell, CellLocations } from './cell.model';

describe(Cell, () => {
  describe('not a mine', () => {
    describe('no neighbors', () => {
      const neighbors: CellLocations = {};
      let model: Cell;

      beforeAll(() => {
        model = new Cell(neighbors);
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

    describe('topLeft neighbor', () => {
      const neighbors: CellLocations = {
        topLeft: new Cell({}, { isMine: true }),
      };
      let model: Cell;

      beforeAll(() => {
        model = new Cell(neighbors);
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
