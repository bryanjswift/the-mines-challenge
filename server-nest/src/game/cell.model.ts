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

type CellLocation = keyof CellLocations;

function getOppositeLocation(location: CellLocation): CellLocation {
  switch (location) {
    case 'topLeft':
      return 'bottomRight';
    case 'top':
      return 'bottom';
    case 'topRight':
      return 'bottomLeft';
    case 'right':
      return 'left';
    case 'bottomRight':
      return 'topLeft';
    case 'bottom':
      return 'top';
    case 'bottomLeft':
      return 'topRight';
    case 'left':
      return 'right';
  }
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

  constructor(state?: CellState) {
    this.id = uuid();
    this.isFlagged = state?.isFlagged || false;
    this.isMine = state?.isMine || false;
    this.isOpen = state?.isOpen || false;
    this.neighbors = {};
  }

  get isBorder(): boolean {
    return this.neighborCells.length < 8;
  }

  get mineCount(): number {
    return this.neighborCells.reduce((count, cell) => count + (cell.isMine ? 1 : 0), 0);
  }

  add(location: keyof CellLocations, cell: Cell): Cell {
    this.setNeighbor(location, cell);
    cell.setNeighbor(getOppositeLocation(location), this);
    return this;
  }

  private setNeighbor(location: CellLocation, cell: Cell): Cell {
    if (this.neighbors[location] !== undefined) {
      throw new Error(`Neighbor(${location}) for ${this.id} already exists`);
    } else {
      this.neighbors[location] = cell;
    }
    return this;
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
