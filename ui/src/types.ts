export type GameBoard = GameCell[][];
export type GameCell = string;
export type GameId = string;
export type GameListResponse = GameId[];

export interface ResponseError {
  message: string;
  statusCode: number;
}
