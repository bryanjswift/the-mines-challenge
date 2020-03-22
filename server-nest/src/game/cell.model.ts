import { v4 as uuid } from 'uuid';

export interface CellLocations extends Record<string, Cell> {
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

interface CellState {
  isFlagged?: boolean;
  isMine?: boolean;
  isOpen?: boolean;
}

const DEFAULT_CELL_STATE: Required<CellState> = {
  isFlagged: false,
  isMine: false,
  isOpen: false,
};

export class Cell {
  readonly id: CellId;
  readonly initialState: Required<CellState>;
  readonly isMine: boolean;
  private readonly positionalNeighbors: CellLocations;

  constructor(state?: CellState) {
    this.id = uuid();
    this.initialState = Object.freeze({ ...DEFAULT_CELL_STATE, ...state });
    this.isMine = this.initialState.isMine;
    this.positionalNeighbors = {};
  }

  get isBorder(): boolean {
    return this.neighbors.length < 8;
  }

  get mineCount(): number {
    return this.neighbors.reduce(
      (count, cell) => count + (cell.isMine ? 1 : 0),
      0
    );
  }

  get neighbors(): Cell[] {
    const neighbors = this.positionalNeighbors;
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
    return result.filter((cell) => cell !== undefined);
  }

  get neighborsChain(): Cell[] {
    if (this.isMine || this.mineCount > 0) {
      return [];
    } else {
      return this.getNeighborChain([this.id]);
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
    return this.positionalNeighbors[location];
  }

  private get isEmpty(): boolean {
    return !this.isMine && this.mineCount === 0;
  }

  private getNeighborChain(ignore: CellId[]): Cell[] {
    const neighborIds = this.neighbors.map((cell) => cell.id);
    const chainedNeighbors = this.neighbors.filter(
      (cell) => !ignore.includes(cell.id) && cell.isEmpty
    );
    const chainsFromNeighbors = chainedNeighbors
      .map((cell) => cell.getNeighborChain([...ignore, ...neighborIds]))
      .flat();
    return [...chainedNeighbors, ...chainsFromNeighbors];
  }

  private setNeighbor(location: CellLocation, cell: Cell): Cell {
    if (this.positionalNeighbors[location] === undefined) {
      this.positionalNeighbors[location] = cell;
    } else if (this.positionalNeighbors[location] !== cell) {
      throw new Error(`Neighbor(${location}) for ${this.id} already exists`);
    }
    return this;
  }
}
