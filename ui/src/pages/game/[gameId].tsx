import unfetch from 'isomorphic-unfetch';
import { GetServerSideProps } from 'next';
import React, { Fragment, PropsWithChildren, useState } from 'react';
import { GameBoard, GameId } from '../../types';

const fetch = unfetch;

interface GameResponse {
  id: GameId;
  board: GameBoard;
  status: 'OPEN' | 'WON' | 'LOST';
}

interface BoardProps extends Pick<Props, 'board'> {
  onCell: (col: number, row: number) => void;
}

interface CellProps {
  column: number;
  row: number;
  onCell: (col: number, row: number) => void;
}

type Props = GameResponse;
type State = GameResponse;

function Cell(props: PropsWithChildren<CellProps>): JSX.Element {
  const { column, row, children, onCell } = props;
  return (
    <td
      key={`${row}:${column}`}
      valign="middle"
      align="center"
      onClick={onCell.bind(null, column, row)}
      style={{
        height: '50px',
        width: '50px',
        border: '1px solid black',
      }}
    >
      {children}
    </td>
  );
}

function Board(props: BoardProps): JSX.Element {
  const { board, onCell } = props;
  return (
    <table>
      <tbody>
        {board.map((row, rowNumber) => (
          <tr key={rowNumber}>
            {row.map((cell, colNumber) => (
              <Cell column={colNumber} row={rowNumber} onCell={onCell}>
                {cell}
              </Cell>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GameStatus(props: Pick<Props, 'status'>): JSX.Element {
  const { status } = props;
  switch (status) {
    case 'LOST':
      return <h2>BOOM 💥</h2>;
    case 'WON':
      return <h2>You did the thing! 🥳</h2>;
    case 'OPEN':
      return <Fragment />;
  }
}

function ShowGame(props: Props): JSX.Element {
  const { id } = props;
  const [state, setState] = useState<State>(props);
  async function openCell(col: number, row: number): Promise<void> {
    if (state.status !== 'OPEN') {
      return;
    }
    return fetch(`http://localhost:3000/game/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x: col,
        y: row,
      }),
    })
      .then((response) => response.json())
      .then((result: GameResponse) => setState(result));
  }
  return (
    <Fragment>
      <h1>Game: {id}</h1>
      <Board {...props} onCell={openCell} />
      <GameStatus status={state.status} />
    </Fragment>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const gameId = context.params?.gameId;
  const response = await fetch(`http://localhost:3000/game/${gameId}`);
  const props: GameResponse = response.ok
    ? await response.json()
    : {
        board: [],
        id: 'server_error',
        status: 'LOST',
      };
  return { props };
};

export default ShowGame;
