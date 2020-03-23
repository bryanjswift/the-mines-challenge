import { Cell } from './cell.model';
import { Game, GameStatus } from './game.model';

describe.only(Game, () => {
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
      game.open(game.cells[0].id);
      // prettier-ignore
      expect(game.board).toEqual([
        '3', ' ',
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

  describe('Won 4x4', () => {
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

  describe('Open 4x4', () => {
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
          new Cell({ isMine: false }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
          // Row 2
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
          new Cell({ isMine: false }),
          new Cell({ isMine: false }),
          // Row 3
          new Cell({ isMine: true }),
          new Cell({ isMine: false }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
          // Row 4
          new Cell({ isMine: true }),
          new Cell({ isMine: false }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
        ],
      });
    });

    it('has a game with cells', () => {
      expect(game.cells).toHaveLength(16);
    });

    it('has known game board', () => {
      // prettier-ignore
      expect(game.board).toEqual([
        ' ', ' ', ' ', ' ',
        ' ', ' ', ' ', ' ',
        ' ', ' ', ' ', ' ',
        ' ', ' ', ' ', ' ',
      ]);
    });

    it('is an OPEN game', () => {
      expect(game.gameStatus).toBe(GameStatus.OPEN);
    });
  });
});
