import { Cell } from './cell.model';
import { CellView } from './cell.view';
import { Game, GameStatus } from './game.model';

describe(Game, () => {
  describe(`
  +---+---+
  | 3 | M |
  | M | M |
  +---+---+
  `, () => {
    let game: Game;

    beforeEach(() => {
      game = new Game({
        rows: 2,
        columns: 2,
        cells: [
          new Cell({ isMine: false }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
        ],
      });
    });

    it('has a game with cells', () => {
      expect(game.cells).toHaveLength(4);
    });

    it('has all unknown initial status', () => {
      // prettier-ignore
      expect(game.board).toEqual([
        ' ', ' ',
        ' ', ' ',
      ]);
    });

    it('shows mine count when 0,0 is opened', () => {
      const updatedGame = game.open(game.cells[0].id);
      // prettier-ignore
      expect(updatedGame.board).toEqual([
        '3', ' ',
        ' ', ' ',
      ]);
    });

    it('shows flag when 0,0 is flagged', () => {
      const updatedGame = game.flagCoordinates(0, 0);
      // prettier-ignore
      expect(updatedGame.board).toEqual([
        'F', ' ',
        ' ', ' ',
      ]);
    });
  });

  describe(`
  +---+---+---+
  | 2 | M | M |
  | M | 6 | 4 |
  | M | M | M |
  +---+---+---+
  `, () => {
    let game: Game;

    beforeEach(() => {
      game = new Game({
        rows: 3,
        columns: 3,
        cells: [
          // Row 1
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
          // Row 2
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: true, isMine: false }),
          // Row 3
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
        ],
      });
    });

    it('has a game with cells', () => {
      expect(game.cells).toHaveLength(9);
    });

    it('has known game board', () => {
      // prettier-ignore
      expect(game.board).toEqual([
        '2', 'M', 'M',
        'M', '6', '4',
        'M', 'M', 'M',
      ]);
    });
  });

  describe(`
  +---+---+---+---+
  | 3 | M | M | M |
  | M | M | 6 | 4 |
  | M | 6 | M | M |
  | M | 4 | M | M |
  +---+---+---+---+
  `, () => {
    let game: Game;

    beforeEach(() => {
      game = new Game({
        rows: 4,
        columns: 4,
        cells: [
          // Row 1
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
          // Row 2
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: true, isMine: false }),
          // Row 3
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
          // Row 4
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: true, isMine: true }),
          new Cell({ isOpen: true, isMine: true }),
        ],
      });
    });

    it('has a game with cells', () => {
      expect(game.cells).toHaveLength(16);
    });

    it('has known game board', () => {
      // prettier-ignore
      expect(game.board).toEqual([
        '3', 'M', 'M', 'M',
        'M', 'M', '6', '4',
        'M', '6', 'M', 'M',
        'M', '4', 'M', 'M',
      ]);
    });

    it('is a LOST game', () => {
      expect(game.gameStatus).toBe(GameStatus.LOST);
    });
  });

  describe(`
  +---+---+---+---+
  | 3 | M | 2 | 0 |
  | M | M | 2 | 0 |
  | 2 | 2 | 1 | 0 |
  | 0 | 0 | 0 | 0 |
  +---+---+---+---+
  `, () => {
    let game: Game;
    let cells: Cell[];
    const rows = 4;
    const columns = 4;

    beforeAll(() => {
      cells = [
        // Row 1
        new Cell({ isMine: false }),
        new Cell({ isMine: true }),
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
        // Row 2
        new Cell({ isMine: true }),
        new Cell({ isMine: true }),
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
        // Row 3
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
        // Row 4
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
        new Cell({ isMine: false }),
      ];
    });

    beforeEach(() => {
      game = new Game({ rows, columns, cells });
    });

    it('has a game with cells', () => {
      expect(game.cells).toHaveLength(16);
    });

    it('has known initial game board', () => {
      // prettier-ignore
      expect(game.board).toEqual([
        ' ', ' ', ' ', ' ',
        ' ', ' ', ' ', ' ',
        ' ', ' ', ' ', ' ',
        ' ', ' ', ' ', ' ',
      ]);
    });

    it('has known initial game board', () => {
      game = new Game({
        rows,
        columns,
        views: cells.map((cell) => new CellView(cell, { isOpen: true })),
      });
      // prettier-ignore
      expect(game.board).toEqual([
        '3', 'M', '2', '0',
        'M', 'M', '2', '0',
        '2', '2', '1', '0',
        '0', '0', '0', '0',
      ]);
    });

    it('is an OPEN game', () => {
      expect(game.gameStatus).toBe(GameStatus.OPEN);
    });
  });

  describe(`
  +---+---+---+---+
  | 3 |   |   |   |
  |   |   | 6 | 4 |
  |   | 6 |   |   |
  |   | 4 |   |   |
  +---+---+---+---+
  `, () => {
    let game: Game;

    beforeEach(() => {
      // | 3 | M | M | M |
      // | M | M | 6 | 4 |
      // | M | 6 | M | M |
      // | M | 4 | M | M |
      game = new Game({
        rows: 4,
        columns: 4,
        cells: [
          // Row 1
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: false, isMine: true }),
          // Row 2
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: true, isMine: false }),
          // Row 3
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: false, isMine: true }),
          // Row 4
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: true, isMine: false }),
          new Cell({ isOpen: false, isMine: true }),
          new Cell({ isOpen: false, isMine: true }),
        ],
      });
    });

    it('has a game with cells', () => {
      expect(game.cells).toHaveLength(16);
    });

    it('has known game board', () => {
      // prettier-ignore
      expect(game.board).toEqual([
        '3', ' ', ' ', ' ',
        ' ', ' ', '6', '4',
        ' ', '6', ' ', ' ',
        ' ', '4', ' ', ' ',
      ]);
    });

    it('is a WON game', () => {
      expect(game.gameStatus).toBe(GameStatus.WON);
    });
  });
});

describe('new Game', () => {
  describe('2x2', () => {
    let game: Game;

    beforeEach(() => {
      game = new Game({ rows: 2, columns: 2 });
    });

    it('generates four cells', () => {
      expect(game.cells).toHaveLength(4);
    });

    it('generates four board values', () => {
      expect(game.board).toHaveLength(4);
    });

    it('associates first cell with others', () => {
      expect(game.cells[0].getNeighbor('right')).toBe(game.cells[1]);
      expect(game.cells[0].getNeighbor('bottomRight')).toBe(game.cells[3]);
      expect(game.cells[0].getNeighbor('bottom')).toBe(game.cells[2]);
    });

    it('associates third cell with others', () => {
      expect(game.cells[2].getNeighbor('top')).toBe(game.cells[0]);
      expect(game.cells[2].getNeighbor('topRight')).toBe(game.cells[1]);
      expect(game.cells[2].getNeighbor('right')).toBe(game.cells[3]);
    });
  });
});

describe('Game#findCell', () => {
  let cells: Cell[];
  let game: Game;

  beforeAll(() => {
    // | 3 | M | 2 | 0 |
    // | M | M | 2 | 0 |
    // | 2 | 2 | 1 | 0 |
    // | 0 | 0 | 0 | 0 |
    cells = [
      // Row 1
      new Cell({ isMine: false }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 2
      new Cell({ isMine: true }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 3
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 4
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
    ];
  });

  beforeEach(() => {
    game = new Game({
      rows: 4,
      columns: 4,
      cells,
    });
  });

  it('finds the first cell', () => {
    const subject = game.findCell(0, 0);
    expect(subject.id).toEqual(cells[0].id);
  });

  it('finds the last cell', () => {
    const subject = game.findCell(3, 3);
    expect(subject.id).toEqual(cells[cells.length - 1].id);
  });

  it('finds cell at (2, 2)', () => {
    const subject = game.findCell(2, 2);
    expect(subject.id).toEqual(cells[10].id);
  });

  it('throws when column is out of bounds', () => {
    expect(() => game.findCell(4, 0)).toThrowError(/columns/);
  });

  it('throws when row is out of bounds', () => {
    expect(() => game.findCell(0, 4)).toThrowError(/rows/);
  });
});

describe('Game#flagCoordinates', () => {
  let cells: Cell[];
  let game: Game;

  beforeAll(() => {
    // | 3 | M | 2 | 0 |
    // | M | M | 2 | 0 |
    // | 2 | 2 | 1 | 0 |
    // | 0 | 0 | 0 | 0 |
    cells = [
      // Row 1
      new Cell({ isMine: false }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 2
      new Cell({ isMine: true }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 3
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 4
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
    ];
  });

  beforeEach(() => {
    game = new Game({
      rows: 4,
      columns: 4,
      cells,
    });
  });

  it('retains the id', () => {
    const subject = game.flagCoordinates(0, 0);
    expect(subject.id).toEqual(game.id);
  });

  it('flags only one cell', () => {
    const subject = game.flagCoordinates(0, 0);
    // prettier-ignore
    expect(subject.board).toEqual([
      'F', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
  });

  it('does not lose game when flagging mine', () => {
    const subject = game.flagCoordinates(1, 0);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', 'F', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
    expect(subject.gameStatus).toBe(GameStatus.OPEN);
  });

  it('flags cell at (2, 2)', () => {
    const subject = game.flagCoordinates(2, 2);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', 'F', ' ',
      ' ', ' ', ' ', ' ',
    ]);
  });

  it('throws when column is out of bounds', () => {
    expect(() => game.flagCoordinates(4, 0)).toThrowError(/columns/);
  });

  it('throws when row is out of bounds', () => {
    expect(() => game.flagCoordinates(0, 4)).toThrowError(/rows/);
  });
});

describe('Game#open', () => {
  let cells: Cell[];
  let game: Game;

  beforeAll(() => {
    // | 3 | M | 2 | 0 |
    // | M | M | 2 | 0 |
    // | 2 | 2 | 1 | 0 |
    // | 0 | 0 | 0 | 0 |
    cells = [
      // Row 1
      new Cell({ isMine: false }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 2
      new Cell({ isMine: true }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 3
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 4
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
    ];
  });

  beforeEach(() => {
    game = new Game({
      rows: 4,
      columns: 4,
      cells,
    });
  });

  it('retains the id', () => {
    const subject = game.open(game.cells[0].id);
    expect(subject.id).toEqual(game.id);
  });

  it('opens only one cell when no chained cell', () => {
    const subject = game.open(game.cells[0].id);
    // prettier-ignore
    expect(subject.board).toEqual([
      '3', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
  });

  it('opens many cells when multiple adjacent empty', () => {
    const { cells } = game;
    const subject = game.open(cells[cells.length - 1].id);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', ' ', '2', '0',
      ' ', ' ', '2', '0',
      '2', '2', '1', '0',
      '0', '0', '0', '0',
    ]);
  });

  it('loses game when opening mine', () => {
    const { cells } = game;
    const mineIndex = cells.findIndex((cell) => cell.isMine);
    const subject = game.open(cells[mineIndex].id);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', 'M', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
    expect(subject.gameStatus).toBe(GameStatus.LOST);
  });

  it('throws when cell id is invalid', () => {
    expect(() => game.open('foo')).toThrow();
  });
});

describe('Game#openCoordinates', () => {
  let cells: Cell[];
  let game: Game;

  beforeAll(() => {
    // | 3 | M | 2 | 0 |
    // | M | M | 2 | 0 |
    // | 2 | 2 | 1 | 0 |
    // | 0 | 0 | 0 | 0 |
    cells = [
      // Row 1
      new Cell({ isMine: false }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 2
      new Cell({ isMine: true }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 3
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 4
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
    ];
  });

  beforeEach(() => {
    game = new Game({
      rows: 4,
      columns: 4,
      cells,
    });
  });

  it('retains the id', () => {
    const subject = game.openCoordinates(0, 0);
    expect(subject.id).toEqual(game.id);
  });

  it('opens only one cell when no chained cell', () => {
    const subject = game.openCoordinates(0, 0);
    // prettier-ignore
    expect(subject.board).toEqual([
      '3', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
  });

  it('opens many cells when multiple adjacent empty', () => {
    const subject = game.openCoordinates(3, 3);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', ' ', '2', '0',
      ' ', ' ', '2', '0',
      '2', '2', '1', '0',
      '0', '0', '0', '0',
    ]);
  });

  it('loses game when opening mine', () => {
    const subject = game.openCoordinates(1, 0);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', 'M', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
    expect(subject.gameStatus).toBe(GameStatus.LOST);
  });

  it('opens cell at (2, 2)', () => {
    const subject = game.openCoordinates(2, 2);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', '1', ' ',
      ' ', ' ', ' ', ' ',
    ]);
  });

  it('throws when column is out of bounds', () => {
    expect(() => game.openCoordinates(4, 0)).toThrowError(/columns/);
  });

  it('throws when row is out of bounds', () => {
    expect(() => game.openCoordinates(0, 4)).toThrowError(/rows/);
  });
});

describe('Game#unflagCoordinates', () => {
  let cells: Cell[];
  let game: Game;

  beforeAll(() => {
    // | 3 | M | 2 | 0 |
    // | M | M | 2 | 0 |
    // | 2 | 2 | 1 | 0 |
    // | 0 | 0 | 0 | 0 |
    cells = [
      // Row 1
      new Cell({ isMine: false }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 2
      new Cell({ isMine: true }),
      new Cell({ isMine: true }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 3
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      // Row 4
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
      new Cell({ isMine: false }),
    ];
  });

  beforeEach(() => {
    game = new Game({
      rows: 4,
      columns: 4,
      cells,
    });
  });

  it('retains the id', () => {
    const subject = game.unflagCoordinates(0, 0);
    expect(subject.id).toEqual(game.id);
  });

  it('does nothing when cell not flagged', () => {
    const subject = game.unflagCoordinates(0, 0);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
  });

  it('goes back to same state when unflagging flagged cell', () => {
    const intermediate = game.flagCoordinates(0, 0);
    // prettier-ignore
    expect(intermediate.board).toEqual([
      'F', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
    const subject = intermediate.unflagCoordinates(0, 0);
    // prettier-ignore
    expect(subject.board).toEqual([
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ',
    ]);
  });

  it('throws when column is out of bounds', () => {
    expect(() => game.unflagCoordinates(4, 0)).toThrowError(/columns/);
  });

  it('throws when row is out of bounds', () => {
    expect(() => game.unflagCoordinates(0, 4)).toThrowError(/rows/);
  });
});
