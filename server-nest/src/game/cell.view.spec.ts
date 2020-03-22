import { Cell } from './cell.model';
import { CellView } from './cell.view';

describe(CellView, () => {
  describe('for a non-mine Cell', () => {
    const isMine = false;

    describe('w/ no neighbors', () => {
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine });
      });

      describe('and not open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: false });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe(' ');
        });
      });

      describe('and flagged', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isFlagged: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('F');
        });
      });

      describe('and open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('0');
        });
      });
    });

    describe('w/ right neighbor', () => {
      const neighbor = new Cell({ isMine: true });
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine });
        model.add('right', neighbor);
      });

      describe('and not open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: false });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe(' ');
        });
      });

      describe('and flagged', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isFlagged: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('F');
        });
      });

      describe('and open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('1');
        });
      });
    });
  });

  describe('for a mine Cell', () => {
    const isMine = true;

    describe('w/ no neighbors', () => {
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine });
      });

      describe('and not open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: false });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe(' ');
        });
      });

      describe('and flagged', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isFlagged: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('F');
        });
      });

      describe('and open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('M');
        });
      });
    });

    describe('w/ right neighbor', () => {
      const neighbor = new Cell({ isMine: true });
      let model: Cell;

      beforeAll(() => {
        model = new Cell({ isMine });
        model.add('right', neighbor);
      });

      describe('and not open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: false });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe(' ');
        });
      });

      describe('and flagged', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isFlagged: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('F');
        });
      });

      describe('and open', () => {
        let view: CellView;

        beforeEach(() => {
          view = new CellView(model, { isOpen: true });
        });

        it('indicates an unknown status', () => {
          expect(view.status).toBe('M');
        });
      });
    });
  });
});
