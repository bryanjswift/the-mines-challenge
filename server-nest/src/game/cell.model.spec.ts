import { Cell } from './cell.model';

describe(Cell, () => {
  describe('#add', () => {
    let model: Cell;

    beforeEach(() => {
      model = new Cell();
    });

    it('returns itself when adding', () => {
      const neighbor = new Cell();
      expect(model.add('top', neighbor)).toBe(model);
    });

    it('adds the neighbor', () => {
      expect(model.getNeighbor('top')).toBeUndefined();
      const neighbor = new Cell();
      model.add('top', neighbor);
      expect(model.getNeighbor('top')).toBe(neighbor);
    });

    it('adds does nothing when adding same neighbor to same location', () => {
      const neighbor = new Cell();
      model.add('top', neighbor);
      model.add('top', neighbor);
      expect(model.getNeighbor('top')).toBe(neighbor);
    });

    it('throws when adding new neighbor to populated location', () => {
      const neighbor = new Cell();
      const viking = new Cell();
      model.add('top', neighbor);
      expect(() => model.add('top', viking)).toThrow();
    });
  });

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
    });
  });
});

describe(`
| 0 | 0 | 1 | M |
`, () => {
  const cell_0_0 = new Cell({ isMine: false });
  const cell_1_0 = new Cell({ isMine: false });
  const cell_2_0 = new Cell({ isMine: false });
  const cell_3_0 = new Cell({ isMine: true });

  beforeEach(() => {
    cell_0_0.add('right', cell_1_0);
    cell_1_0.add('right', cell_2_0);
    cell_2_0.add('right', cell_3_0);
  });

  describe('cell_0_0.neighborsChain', () => {
    it('has a neighbor chain of two', () => {
      expect(cell_0_0.neighborsChain).toHaveLength(2);
    });

    it('includes cell_1_0', () => {
      expect(cell_0_0.neighborsChain).toContain(cell_1_0);
    });

    it('includes cell_2_0', () => {
      expect(cell_0_0.neighborsChain).toContain(cell_2_0);
    });
  });

  describe('cell_1_0.neighborsChain', () => {
    it('has a neighbor chain of two', () => {
      expect(cell_1_0.neighborsChain).toHaveLength(2);
    });

    it('includes cell_0_0', () => {
      expect(cell_1_0.neighborsChain).toContain(cell_0_0);
    });

    it('includes cell_2_0', () => {
      expect(cell_1_0.neighborsChain).toContain(cell_2_0);
    });
  });

  describe('cell_2_0.neighborsChain', () => {
    it('has a neighbor chain of zero', () => {
      expect(cell_2_0.neighborsChain).toHaveLength(0);
    });
  });
});

// Generate a 2x2 game
describe(`
| ' ' | 'M' |
| 'M' | 'M' |
`, () => {
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

describe('Cell.neighborsChain', () => {
  // Generate a 2x2 game
  describe(`
  | ' ' | ' ' |
  | ' ' | ' ' |
  `, () => {
    const cell_0_0 = new Cell({ isMine: false });
    const cell_1_0 = new Cell({ isMine: false });
    const cell_0_1 = new Cell({ isMine: false });
    const cell_1_1 = new Cell({ isMine: false });

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
      it('has three chained neighbors', () => {
        expect(cell_0_0.neighborsChain).toHaveLength(3);
      });
    });

    describe('cell_0_1', () => {
      it('has three chained neighbors', () => {
        expect(cell_0_1.neighborsChain).toHaveLength(3);
      });
    });

    describe('cell_1_0', () => {
      it('has three chained neighbors', () => {
        expect(cell_1_0.neighborsChain).toHaveLength(3);
      });
    });

    describe('cell_1_1', () => {
      it('has three chained neighbors', () => {
        expect(cell_1_1.neighborsChain).toHaveLength(3);
      });
    });
  });

  // Generate a 3x3 game
  describe(`
  | ' ' | '2' | 'M' |
  | ' ' | '2' | 'M' |
  | ' ' | '2' | 'M' |
  `, () => {
    const cell_0_0 = new Cell({ isMine: false });
    const cell_1_0 = new Cell({ isMine: false });
    const cell_2_0 = new Cell({ isMine: false });
    const cell_0_1 = new Cell({ isMine: false });
    const cell_1_1 = new Cell({ isMine: false });
    const cell_2_1 = new Cell({ isMine: false });
    const cell_0_2 = new Cell({ isMine: true });
    const cell_1_2 = new Cell({ isMine: true });
    const cell_2_2 = new Cell({ isMine: true });

    // | cell_0_0 | cell_0_1 | cell_0_2 |
    // | cell_1_0 | cell_1_1 | cell_1_2 |
    // | cell_2_0 | cell_2_1 | cell_2_2 |

    beforeAll(() => {
      // cell_0_0
      cell_0_0.add('right', cell_0_1);
      cell_0_0.add('bottomRight', cell_1_1);
      cell_0_0.add('bottom', cell_1_0);
      // cell_0_1
      cell_0_1.add('right', cell_0_2);
      cell_0_1.add('bottomRight', cell_1_2);
      cell_0_1.add('bottom', cell_1_1);
      cell_0_1.add('bottomLeft', cell_1_0);
      cell_0_1.add('left', cell_0_0);
      // cell_0_2
      cell_0_2.add('left', cell_0_1);
      cell_0_2.add('bottom', cell_1_2);
      cell_0_2.add('bottomLeft', cell_1_1);
      // cell_1_0
      cell_1_0.add('top', cell_0_0);
      cell_1_0.add('topRight', cell_0_1);
      cell_1_0.add('right', cell_1_1);
      cell_1_0.add('bottomRight', cell_2_1);
      cell_1_0.add('bottom', cell_2_0);
      // cell_1_1
      cell_1_1.add('topLeft', cell_0_0);
      cell_1_1.add('top', cell_0_1);
      cell_1_1.add('topRight', cell_0_2);
      cell_1_1.add('right', cell_1_2);
      cell_1_1.add('bottomRight', cell_2_2);
      cell_1_1.add('bottom', cell_2_1);
      cell_1_1.add('bottomLeft', cell_2_0);
      cell_1_1.add('left', cell_1_0);
      // cell_1_2
      cell_1_2.add('topLeft', cell_0_1);
      cell_1_2.add('top', cell_0_2);
      cell_1_2.add('bottom', cell_2_2);
      cell_1_2.add('bottomLeft', cell_2_1);
      cell_1_2.add('left', cell_1_1);
      // cell_2_0
      cell_2_0.add('top', cell_1_0);
      cell_2_0.add('topRight', cell_1_1);
      cell_2_0.add('right', cell_2_1);
      // cell_2_1
      cell_2_1.add('topLeft', cell_1_0);
      cell_2_1.add('top', cell_1_1);
      cell_2_1.add('topRight', cell_1_2);
      cell_2_1.add('right', cell_2_2);
      // cell_2_2
      cell_2_2.add('topLeft', cell_1_1);
      cell_2_2.add('top', cell_1_2);
      cell_2_2.add('left', cell_2_1);
    });

    describe('cell_0_0', () => {
      it('has two chained neighbors', () => {
        expect(cell_0_0.neighborsChain).toHaveLength(5);
      });
    });

    describe('cell_0_1', () => {
      it('has two chained neighbors', () => {
        expect(cell_0_1.neighborsChain).toHaveLength(0);
      });
    });

    describe('cell_0_2', () => {
      it('has two chained neighbors', () => {
        expect(cell_0_2.neighborsChain).toHaveLength(0);
      });
    });

    describe('cell_1_0', () => {
      it('has no chained neighbors', () => {
        expect(cell_1_0.neighborsChain).toHaveLength(5);
      });
    });

    describe('cell_1_1', () => {
      it('has no chained neighbors', () => {
        expect(cell_1_1.neighborsChain).toHaveLength(0);
      });
    });

    describe('cell_1_2', () => {
      it('has no chained neighbors', () => {
        expect(cell_1_2.neighborsChain).toHaveLength(0);
      });
    });

    describe('cell_2_0', () => {
      it('has no chained neighbors', () => {
        expect(cell_2_0.neighborsChain).toHaveLength(5);
      });
    });

    describe('cell_2_1', () => {
      it('has no chained neighbors', () => {
        expect(cell_2_1.neighborsChain).toHaveLength(0);
      });
    });

    describe('cell_2_2', () => {
      it('has no chained neighbors', () => {
        expect(cell_2_2.neighborsChain).toHaveLength(0);
      });
    });
  });
});
