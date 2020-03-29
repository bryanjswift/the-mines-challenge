import { CellId } from './cell.model';

/**
 * Represent the type of game "moves" or "actions" which can be taken on a
 * cell.
 */
export enum GameMoveType {
  FLAG = 'FLAG',
  OPEN = 'OPEN',
}

/**
 * Define the structure of data required to apply a "move" or "action" to a
 * game.
 */
export interface GameMove {
  /** Identifier of the `Cell` to which the action applies. */
  cellId: CellId;
  /** Type of action taken on the given `Cell`. */
  type: GameMoveType;
}
