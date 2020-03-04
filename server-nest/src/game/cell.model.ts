import { v4 as uuid } from 'uuid';

export interface CellLocations {
  topLeft?: Cell;
  top?: Cell;
  topRight?: Cell;
  right?: Cell;
  bottomRight?: Cell;
  bottom?: Cell;
  bottomLeft?: Cell;
  left?: Cell;
}

export interface CellState {
  isFlagged?: boolean;
  isMine: boolean;
  isOpen?: boolean;
}

export class Cell {
  readonly id: string;
  readonly isFlagged: boolean;
  readonly isMine: boolean;
  readonly isOpen: boolean;
  readonly neighbors: CellLocations;

  constructor(neighbors: CellLocations, state?: CellState) {
    this.id = uuid();
    this.isFlagged = state?.isFlagged || false;
    this.isMine = state?.isMine || false;
    this.isOpen = state?.isOpen || false;
    this.neighbors = neighbors;
  }

  get isBorder(): boolean {
    return this.neighborCells.length < 8;
  }

  get mineCount(): number {
    return this.neighborCells.reduce((count, cell) => count + (cell.isMine ? 1 : 0), 0);
  }

  private get neighborCells(): Cell[] {
    const neighbors = this.neighbors;
    const result = [
      neighbors.topLeft,
      neighbors.top,
      neighbors.topRight,
      neighbors.right,
      neighbors.bottomRight,
      neighbors.bottom,
      neighbors.bottomLeft,
      neighbors.left,
    ];
    return result.filter(cell => cell !== undefined);
  }
}
