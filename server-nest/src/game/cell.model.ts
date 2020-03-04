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

function getRelatedLocations(location: CellLocation): Array<{ location: CellLocation, neighbor: CellLocation }> {
  switch (location) {
    case 'topLeft':
      return [{location: 'top', neighbor: 'left'}, {location: 'left', neighbor: 'top'}];
    case 'top':
      return [{location: 'topLeft', neighbor: 'right'}, {location: 'topRight', neighbor: 'left'}];
    case 'topRight':
      return [{location: 'top', neighbor: 'right'}, {location: 'right', neighbor: 'top'}];
    case 'right':
      return [{location: 'topRight', neighbor: 'bottom'}, {location: 'bottomRight', neighbor: 'top'}];
    case 'bottomRight':
      return [{location: 'bottom', neighbor: 'right'}, {location: 'right', neighbor: 'bottom'}];
    case 'bottom':
      return [{location: 'bottomLeft', neighbor: 'right'}, {location: 'bottomRight', neighbor: 'left'}];
    case 'bottomLeft':
      return [{location: 'bottom', neighbor: 'left'}, {location: 'left', neighbor: 'bottom'}];
    case 'left':
      return [{location: 'topLeft', neighbor: 'bottom'}, {location: 'bottomLeft', neighbor: 'top'}];
  }
}

export interface CellState {
  isFlagged?: boolean;
  isMine: boolean;
  isOpen?: boolean;
}

export class Cell {
  readonly id: CellId;
  isFlagged: boolean;
  readonly isMine: boolean;
  isOpen: boolean;
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
    // set my neighbor
    this.setNeighbor(location, cell);
    // populate the neighbors
    cell.setNeighbor(getOppositeLocation(location), this);
    /*
    const relatedLocations = getRelatedLocations(location);
    relatedLocations.forEach(props => {
      const { location, neighbor } = props;
      const neighborCell = this.neighbors[location];
      if (neighborCell !== undefined) {
        neighborCell.add(neighbor, cell);
      }
    });
    */
    return this;
  }

  getNeighbor(location: CellLocation): Cell {
    return this.neighbors[location];
  }

  toString(): string {
    return `Cell(${this.id})`;
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
