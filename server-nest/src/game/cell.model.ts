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

export type CellLocation = keyof CellLocations;

export type CellId = string;

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

const DEFAULT_CELL_STATE: CellState = {
  isFlagged: false,
  isMine: false,
  isOpen: false,
};

export class Cell {
  readonly id: CellId;
  isFlagged: boolean;
  readonly isMine: boolean;
  isOpen: boolean;
  readonly neighbors: CellLocations;

  constructor(state?: CellState) {
    this.id = uuid();
    const { isFlagged, isMine, isOpen } = { ...DEFAULT_CELL_STATE, ...state };
    this.isFlagged = isFlagged;
    this.isMine = isMine;
    this.isOpen = isOpen;
    this.neighbors = {};
  }

  get isBorder(): boolean {
    return this.neighborCells.length < 8;
  }

  get mineCount(): number {
    return this.neighborCells.reduce(
      (count, cell) => count + (cell.isMine ? 1 : 0),
      0
    );
  }

  get status(): string {
    if (this.isFlagged) {
      return 'F';
    } else if (this.isOpen && this.isMine) {
      return 'M';
    } else if (this.isOpen) {
      return `${this.mineCount}`;
    } else {
      return ' ';
    }
  }

  add(location: CellLocation, cell: Cell): Cell {
    // set my neighbor
    this.setNeighbor(location, cell);
    // populate the neighbors
    cell.setNeighbor(getOppositeLocation(location), this);
    return this;
  }

  getNeighbor(location: CellLocation): Cell {
    return this.neighbors[location];
  }

  private setNeighbor(location: CellLocation, cell: Cell): Cell {
    if (this.neighbors[location] === undefined) {
      this.neighbors[location] = cell;
    } else if (this.neighbors[location] !== cell) {
      throw new Error(`Neighbor(${location}) for ${this.id} already exists`);
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
