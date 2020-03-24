import { Cell } from './cell.model';
import { Game } from './game.model';
import { GameView, serializeGame } from './game.view';

describe(serializeGame, () => {
  describe('GameStatus.OPEN', () => {
    let game: Game;
    let subject: GameView;

    beforeEach(() => {
      game = new Game({ rows: 10, columns: 10 });
      subject = serializeGame(game);
    });

    it('has a matching id', () => {
      expect(subject).toHaveProperty('id', game.id);
    });

    it('has a matching board', () => {
      expect(subject).toHaveProperty('board', game.board);
    });

    it('has an open status', () => {
      expect(subject).toHaveProperty('status', 'open');
    });
  });

  describe('GameStatus.WON', () => {
    let game: Game;
    let subject: GameView;

    beforeEach(() => {
      game = new Game({
        rows: 2,
        columns: 2,
        cells: [
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
          new Cell({ isMine: true }),
        ],
      });
      subject = serializeGame(game);
    });

    it('has a matching id', () => {
      expect(subject).toHaveProperty('id', game.id);
    });

    it('has a matching board', () => {
      expect(subject).toHaveProperty('board', game.board);
    });

    it('has an open status', () => {
      expect(subject).toHaveProperty('status', 'won');
    });
  });

  describe('GameStatus.LOST', () => {
    let game: Game;
    let subject: GameView;

    beforeEach(() => {
      const cells = [
        new Cell({ isMine: true }),
        new Cell({ isMine: true }),
        new Cell({ isMine: true }),
        new Cell({ isMine: true }),
      ];
      game = new Game({
        rows: 2,
        columns: 2,
        cells,
        moves: [cells[0].id],
      });
      subject = serializeGame(game);
    });

    it('has a matching id', () => {
      expect(subject).toHaveProperty('id', game.id);
    });

    it('has a matching board', () => {
      expect(subject).toHaveProperty('board', game.board);
    });

    it('has an open status', () => {
      expect(subject).toHaveProperty('status', 'lost');
    });
  });
});
