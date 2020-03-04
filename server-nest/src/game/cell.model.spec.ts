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

// Generate a 2x2 game
describe('2x2', () => {
  const cell_0_0 = new Cell({ isMine: false });
  const cell_1_0 = new Cell({ isMine: true });
  const cell_0_1 = new Cell({ isMine: true });
  const cell_1_1 = new Cell({ isMine: true });

  beforeAll(() => {
    cell_0_0.add('right', cell_0_1);
    cell_0_0.add('bottomRight', cell_1_1);
    cell_0_0.add('bottom', cell_1_0);
  });

  // | cell_0_0 | cell_0_1 |
  // | cell_1_0 | cell_1_1 |

  describe('cell_0_0', () => {
    it('counts three mines', () => {
      expect(cell_0_0.mineCount).toBe(3);
    });

    it('has cell_1_1 as bottomRight', () => {
      expect(cell_0_0.getNeighbor('bottomRight')).toBe(cell_1_1);
    });

    it('has cell_0_1 as right', () => {
      expect(cell_0_0.getNeighbor('right')).toBe(cell_0_1);
    });

    it('has cell_1_0 as bottom', () => {
      expect(cell_0_0.getNeighbor('bottom')).toBe(cell_1_0);
    });
  });

  describe('cell_1_0', () => {
    it('counts two mines', () => {
      expect(cell_1_0.mineCount).toBe(2);
    });

    it('has cell_0_0 as top', () => {
      expect(cell_1_0.getNeighbor('top')).toBe(cell_0_0);
    });

    it('has cell_0_1 as right', () => {
      expect(cell_1_0.getNeighbor('right')).toBe(cell_1_1);
    });

    it('has cell_1_0 as bottom', () => {
      expect(cell_1_0.getNeighbor('topRight')).toBe(cell_0_1);
    });
  });
})
