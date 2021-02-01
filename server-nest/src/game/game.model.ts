import { v4 as uuid } from 'uuid';
import { Cell, CellId, pickCellId } from './cell.model';
import { CellView } from './cell.view';
import { GameMove, GameMoveType } from './game-move.model';
import { OutOfBoundsException } from './out-of-bounds.exception';

export enum GameStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
}

interface GridProps {
  columns: number;
  rows: number;
  moves?: GameMove[];
  id?: string;
}

interface InitialCells extends GridProps {
  cells: Cell[];
}

interface InitialViews extends GridProps {
  views: CellView[];
}

export type GameId = string;

export type Props = GridProps | InitialCells | InitialViews;

function generateCells(cellCount: number, mineProbability = 0.25): Cell[] {
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
  readonly columns: number;
  readonly id: GameId;
  readonly moves: GameMove[];
  readonly rows: number;
  private views: CellView[];

  constructor(props: Props) {
    const { rows, columns, moves = [] } = props;
    // Assign views based on the contents of props
    if ('views' in props) {
      // InitialViews
      // NOTE: If `moves.length > 0` maybe validate the `views` match?
      this.views = props.views;
    } else if ('cells' in props) {
      // InitialCells
      const cells = props.cells;
      associateCells({ rows, columns, cells });
      this.views = Game.computeViews(moves, cells);
    } else {
      // GridProps
      const cellCount = rows * columns;
      const cells = generateCells(cellCount);
      associateCells({ rows, columns, cells });
      this.views = Game.computeViews([], cells);
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

  findCell(column: number, row: number): Cell {
    const gridProps = { rows: this.rows, columns: this.columns };
    const cellIndex = Game.getIndex(gridProps, column, row);
    return this.cells[cellIndex];
  }

  flagCoordinates(column: number, row: number): Game {
    const cellId = this.findCell(column, row).id;
    return this.copyWithGameMove({ type: GameMoveType.FLAG, cellId });
  }

  open(cellId: CellId): Game {
    return this.copyWithGameMove({ type: GameMoveType.OPEN, cellId });
  }

  openCoordinates(column: number, row: number): Game {
    const cellId = this.findCell(column, row).id;
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

  private copyWithGameMove(move: GameMove) {
    const moves = [...this.moves, move];
    const flaggedCell = this.viewCache[move.cellId];
    if (typeof flaggedCell === 'undefined') {
      throw new Error(`Cell with id ${move.cellId} does not exist`);
    }
    const views = Game.computeViews(moves, this.cells);
    return new Game({
      rows: this.rows,
      columns: this.columns,
      id: this.id,
      moves,
      views,
    });
  }

  /**
   * Given a list of `GameMove` and `Cell` instances create a corresponding
   * list of `CellView` representing the state of play.
   * @param moves used to determine the view of each `Cell`.
   * @param cells to be wrapped in `CellView`
   * @returns list of `CellView` instances representing the game state for the
   * `moves` and `cells`.
   */
  private static computeViews(moves: GameMove[], cells: Cell[]): CellView[] {
    const flaggedCellIds = cells
      .filter((cell) => cell.initialState.isFlagged)
      .map(pickCellId)
      .concat(Game.getFlaggedCellIds(moves));
    const openedCellIds = cells
      .filter((cell) => cell.initialState.isOpen)
      .map(pickCellId)
      .concat(Game.getOpenedCellIds(moves));
    const openedCells = cells
      .map((cell) =>
        openedCellIds.includes(cell.id) ? [...cell.neighborsChain, cell] : []
      )
      .flat();
    const openCellIds = openedCells.map(pickCellId);
    return cells.map(
      (cell) =>
        new CellView(cell, {
          isFlagged: flaggedCellIds.includes(cell.id),
          isOpen: openCellIds.includes(cell.id),
        })
    );
  }

  /**
   * Create a lookup table of `CellId -> CellView` from the given list of `CellView`.
   * @param views used to create a lookup table.
   * @returns a lookup table of `CellId -> CellView`.
   */
  private static computeViewCache(views: CellView[]): Record<CellId, CellView> {
    return views.reduce(
      (cache, view) => ({
        ...cache,
        [view.id]: view,
      }),
      {}
    );
  }

  /**
   * Given a list of `GameMove` find the list of `CellId` which should have a
   * flagged state.
   * @param moves to analyze.
   * @returns the list of `CellId` corresponding to flagged `Cell`.
   */
  private static getFlaggedCellIds(moves: GameMove[]): CellId[] {
    return moves
      .filter((move) => move.type === GameMoveType.FLAG)
      .map((move) => move.cellId);
  }

  private static getIndex(
    props: GridProps,
    column: number,
    row: number
  ): number {
    const { rows, columns } = props;
    if (column >= columns) {
      throw new OutOfBoundsException('columns', column);
    } else if (row >= rows) {
      throw new OutOfBoundsException('rows', row);
    }
    return columns * row + column;
  }

  /**
   * Given a list of `GameMove` find the list of `CellId` which should have an
   * open state.
   * @param moves to analyze.
   * @returns the list of `CellId` corresponding to open `Cell`.
   */
  private static getOpenedCellIds(moves: GameMove[]): CellId[] {
    return moves
      .filter((move) => move.type === GameMoveType.OPEN)
      .map((move) => move.cellId);
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

  private get viewCache(): Record<CellId, CellView> {
    return Game.computeViewCache(this.views);
  }
}
