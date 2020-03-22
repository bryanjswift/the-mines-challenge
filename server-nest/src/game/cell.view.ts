import { Cell } from './cell.model';

interface ViewState {
  isFlagged?: boolean;
  isOpen?: boolean;
}

const DEFAULT_VIEW_STATE: Required<ViewState> = {
  isFlagged: false,
  isOpen: false,
};

export class CellView {
  private readonly state: Required<ViewState>;

  constructor(readonly cell: Cell, state?: ViewState) {
    this.state = Object.freeze({
      ...DEFAULT_VIEW_STATE,
      ...state,
    });
  }

  get id(): Cell['id'] {
    return this.cell.id;
  }

  get isFlagged(): boolean {
    return this.state.isFlagged;
  }

  get isMine(): boolean {
    return this.cell.isMine;
  }

  get isOpen(): boolean {
    return this.state.isOpen;
  }

  get status(): string {
    if (this.isFlagged) {
      return 'F';
    } else if (this.isOpen && this.cell.isMine) {
      return 'M';
    } else if (this.isOpen) {
      return `${this.cell.mineCount}`;
    } else {
      return ' ';
    }
  }
}
