import { v4 as uuid } from 'uuid';
import { Cell, CellId } from './cell.model';
import { CellView } from './cell.view';

export enum GameStatus {
  OPEN,
  WON,
  LOST,
}

interface Props {
  columns: number;
  rows: number;
  cells?: Cell[];
}

function generateCells(cellCount: number): Cell[] {
  const cells = new Array(cellCount);
  for (let i = 0; i < cellCount; i++) {
    const isMine = Math.random() > 0.5;
    cells[i] = new Cell({ isMine });
  }
  return cells;
}

function associateCells(props: Required<Props>): void {
  const { cells, rows, columns } = props;
  const cellCount = cells.length;
  let row = -1;
  for (let i = 0; i < cellCount; i++) {
    const column = i % rows;
    if (column === 0) {
      row = row + 1;
    }
    const currentCell = cells[i];
    const rightIndex = i + 1;
    const topIndex = i - columns;
    const topRightIndex = topIndex + 1;
    const topLeftIndex = topIndex - 1;
    if (rightIndex % columns > 0) {
      currentCell.add('right', cells[rightIndex]);
    }
    if (row > 0) {
      currentCell.add('top', cells[topIndex]);
      if (topRightIndex % columns > 0) {
        currentCell.add('topRight', cells[topRightIndex]);
      }
      if (column > 0) {
        currentCell.add('topLeft', cells[topLeftIndex]);
      }
    }
  }
}

export class Game {
  id: string;
  moves: CellId[];
  private _views: CellView[];
  // `viewCache` is upated when `views` is assigned via the `views` setter.
  private viewCache: Record<CellId, CellView>;

  constructor(props: Props, moves: CellId[] = []) {
    const { rows, columns } = props;
    const cellCount = rows * columns;
    const cells =
      props.cells === undefined ? generateCells(cellCount) : props.cells;
    const views = cells.map(
      (cell) => new CellView(cell, { isOpen: cell.initialState.isOpen })
    );
    associateCells({ rows, columns, cells });
    this.id = uuid();
    this.moves = moves;
    this.views = views;
  }

  open(cellId: CellId): Game {
    const moves = [...this.moves, cellId];
    const openIndex = this.views.findIndex((cell) => cell.id === cellId);
    if (openIndex === -1) {
      throw new Error(`Cell with id ${cellId} does not exist`);
    }
    const views = this.views.map((view) =>
      view.id === cellId ? new CellView(view.cell, { isOpen: true }) : view
    );
    // open neighbors if appropriate
    this.moves = moves;
    this.views = views;
    return this;
  }

  get board(): string[] {
    return this.views.map((cell) => cell.status);
  }

  get cells(): Cell[] {
    return this.views.map((view) => view.cell);
  }

  get gameStatus(): GameStatus {
    // if any open cells are a mine; game is lost
    const hasLost = this.views.some((cell) => cell.isOpen && cell.isMine);
    // if all cells except mines are open; game is won
    const hasWon = this.views.every((cell) =>
      cell.isOpen ? !cell.isMine : cell.isMine
    );
    // Get the correct result based on boolean reductions
    if (hasLost) {
      return GameStatus.LOST;
    } else if (hasWon) {
      return GameStatus.WON;
    } else {
      return GameStatus.OPEN;
    }
  }

  private get views(): CellView[] {
    return this._views;
  }

  private set views(views: CellView[]) {
    this._views = views;
    this.viewCache = views.reduce(
      (cache, view) => ({
        ...cache,
        [view.id]: view,
      }),
      {}
    );
  }
}
