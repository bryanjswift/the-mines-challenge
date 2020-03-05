import { Game } from './game.model';

describe.only(Game, () => {
  describe('2x2', () => {
    let game: Game;

    beforeAll(() => {
      game = new Game({ rows: 2, columns: 2 });
    });

    it('has a game with cells', () => {
      expect(game.cells).toHaveLength(4);
    });
  });
});
