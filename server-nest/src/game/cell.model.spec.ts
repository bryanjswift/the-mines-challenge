import { Cell } from './cell.model';

describe(Cell, () => {
  describe('not a mine', () => {
    const isMine = false;

    describe('no neighbors', () => {
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine });
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

      it('indicates an unknown status', () => {
        expect(model.status).toBe(' ');
      });
    });

    describe('w/ right neighbor', () => {
      const neighbor = new Cell({ isMine: true });
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine });
        model.add('right', neighbor);
      });

      it('is not a mine', () => {
        expect(model.isMine).toBe(false);
      });

      it('has a mineCount of 1', () => {
        expect(model.mineCount).toBe(1);
      });

      it('is a border', () => {
        expect(model.isBorder).toBe(true);
      });

      it('indicates an unknown status', () => {
        expect(model.status).toBe(' ');
      });
    });

    describe('open w/ right neighbor', () => {
      const neighbor = new Cell({ isMine: true });
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine, isOpen: true });
        model.add('right', neighbor);
      });

      it('is not a mine', () => {
        expect(model.isMine).toBe(false);
      });

      it('has a mineCount of 1', () => {
        expect(model.mineCount).toBe(1);
      });

      it('is a border', () => {
        expect(model.isBorder).toBe(true);
      });

      it('indicates an known status matching mineCount', () => {
        expect(model.status).toBe('1');
      });
    });
  });

  describe('is a mine', () => {
    const isMine = true;

    describe('not open', () => {
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine, isOpen: false });
      });

      it('indicates an unknown status', () => {
        expect(model.status).toBe(' ');
      });
    });

    describe('open', () => {
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine, isOpen: true });
      });

      it('indicates an mine status', () => {
        expect(model.status).toBe('M');
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

  // | cell_0_0 | cell_0_1 |
  // | cell_1_0 | cell_1_1 |

  beforeAll(() => {
    // cell_0_0
    cell_0_0.add('right', cell_0_1);
    cell_0_0.add('bottomRight', cell_1_1);
    cell_0_0.add('bottom', cell_1_0);
    // cell_0_1
    cell_0_1.add('left', cell_0_0);
    cell_0_1.add('bottomLeft', cell_1_0);
    cell_0_1.add('bottom', cell_1_1);
    // cell_1_0
    cell_1_0.add('top', cell_0_0);
    cell_1_0.add('topRight', cell_0_1);
    cell_1_0.add('right', cell_1_1);
    // cell_1_1
    cell_1_1.add('top', cell_0_1);
    cell_1_1.add('left', cell_1_0);
    cell_1_1.add('topLeft', cell_0_0);
  });

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
});
