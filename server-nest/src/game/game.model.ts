import { v4 as uuid } from 'uuid';
import { Cell, CellId } from './cell.model';

enum GameStatus {
  OPEN,
  WIN,
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
  cells: Cell[];
  id: string;
  moves: CellId[];
  gameStatus: GameStatus;

  constructor(props: Props) {
    const { rows, columns } = props;
    const cellCount = rows * columns;
    if (props.cells === undefined) {
      this.cells = generateCells(cellCount);
    } else {
      this.cells = props.cells;
    }
    associateCells({ rows, columns, cells: this.cells });
    this.id = uuid();
    this.moves = [];
  }

  open(cellId: CellId): Game {
    this.moves = [cellId, ...this.moves];
    const openedCell = this.cells.find(cell => cell.id === cellId);
    if (openedCell === undefined) {
      throw new Error(`Cell with id ${cellId} does not exist`);
    }
    openedCell.isOpen = true;
    if (openedCell.isMine) {
      this.gameStatus = GameStatus.LOST;
    }
    // if all cells are mine or open game is won
    return this;
  }

  get board(): string[] {
    return this.cells.map(cell => cell.status);
  }
}
