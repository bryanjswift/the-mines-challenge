import { v4 as uuid } from 'uuid';
import { Cell, CellId } from './cell.model';
import { CellView } from './cell.view';
import { OutOfBoundsException } from './out-of-bounds.exception';

export enum GameStatus {
  OPEN,
  WON,
  LOST,
}

interface GridProps {
  columns: number;
  rows: number;
  id?: string;
  moves?: CellId[];
}

interface InitialCells extends GridProps {
  cells: Cell[];
}

interface InitialViews extends GridProps {
  views: CellView[];
}

export type Props = GridProps | InitialCells | InitialViews;

function generateCells(cellCount: number, mineProbability = 0.5): Cell[] {
  const cells = new Array(cellCount);
  for (let i = 0; i < cellCount; i++) {
    const isMine = Math.random() < mineProbability;
    cells[i] = new Cell({ isMine });
  }
  const hasMine = cells.some((cell) => cell.isMine);
  if (!hasMine) {
    return generateCells(cellCount, mineProbability);
  } else {
    return cells;
  }
}

function associateCells(props: InitialCells): void {
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
  private readonly columns: number;
  readonly id: string;
  readonly moves: CellId[];
  private readonly rows: number;
  private _views: CellView[];
  // `viewCache` is upated when `views` is assigned via the `views` setter.
  private viewCache: Record<CellId, CellView>;

  constructor(props: Props) {
    const { rows, columns, moves = [] } = props;
    // Assign views based on the contents of props
    if ('views' in props) {
      // InitialViews
      this.views = props.views;
    } else if ('cells' in props) {
      // InitialCells
      const cells = props.cells;
      associateCells({ rows, columns, cells });
      this.views = cells.map(
        (cell) =>
          new CellView(cell, {
            isOpen: cell.initialState.isOpen || moves.includes(cell.id),
          })
      );
    } else {
      // GridProps
      const cellCount = rows * columns;
      const cells = generateCells(cellCount);
      associateCells({ rows, columns, cells });
      this.views = cells.map((cell) => new CellView(cell));
    }
    if ('id' in props) {
      this.id = props.id;
    } else {
      this.id = uuid();
    }
    this.columns = columns;
    this.moves = moves;
    this.rows = rows;
  }

  open(cellId: CellId): Game {
    const moves = [...this.moves, cellId];
    const openedCell = this.viewCache[cellId];
    if (typeof openedCell === 'undefined') {
      throw new Error(`Cell with id ${cellId} does not exist`);
    }
    // find cells to mark as opened, including neighbors
    const openedCellIds = [
      cellId,
      ...openedCell.cell.neighborsChain.map((cell) => cell.id),
    ];
    const views = this.views.map(
      (view) =>
        new CellView(view.cell, {
          isOpen: openedCellIds.includes(view.id) || view.isOpen,
        })
    );
    return new Game({
      rows: this.rows,
      columns: this.columns,
      id: this.id,
      views,
      moves,
    });
  }

  openCoordinates(x: number, y: number): Game {
    const gridProps = { rows: this.rows, columns: this.columns };
    const cellIndex = Game.getIndex(gridProps, x, y);
    const cellId = this.cells[cellIndex].id;
    return this.open(cellId);
  }

  get board(): string[] {
    return this.views.map((cell) => cell.status);
  }

  get cells(): Cell[] {
    return this.views.map((view) => view.cell);
  }

  get gameStatus(): GameStatus {
    // Get the correct result based on boolean reductions
    if (this.isLost) {
      return GameStatus.LOST;
    } else if (this.isWon) {
      return GameStatus.WON;
    } else {
      return GameStatus.OPEN;
    }
  }

  private static getIndex(props: GridProps, x: number, y: number): number {
    const { rows, columns } = props;
    if (x >= rows) {
      throw new OutOfBoundsException('rows', x);
    } else if (y >= columns) {
      throw new OutOfBoundsException('columns', y);
    }
    return columns * x + y;
  }

  private get isLost(): boolean {
    // if any open cells are a mine; game is lost
    return this.views.some((view) => view.isOpen && view.isMine);
  }

  private get isWon(): boolean {
    // if all cells except mines are open; game is won
    return this.views.every((view) =>
      view.isOpen ? !view.isMine : view.isMine
    );
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
