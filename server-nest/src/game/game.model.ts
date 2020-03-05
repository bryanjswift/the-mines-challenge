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
}
