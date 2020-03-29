import unfetch from 'isomorphic-unfetch';
import { GetServerSideProps } from 'next';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import React, { Fragment, PropsWithChildren, useState } from 'react';
import { GameBoard, GameId } from '../../types';

const fetch = unfetch;

interface GameResponse {
  id: GameId;
  board: GameBoard;
  status: 'OPEN' | 'WON' | 'LOST';
}

interface ErrorResponse {
  statusCode: number;
  message: string;
}

type GameProps = GameResponse;

interface BoardProps extends Pick<GameResponse, 'board'> {
  onCell: (col: number, row: number) => void;
}

interface CellProps {
  column: number;
  row: number;
  onCell: (col: number, row: number) => void;
}

type Props = GameResponse | ErrorResponse;
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
              <Cell
                key={`(${colNumber},${rowNumber})`}
                column={colNumber}
                row={rowNumber}
                onCell={onCell}
              >
                {cell}
              </Cell>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GameStatus(props: Pick<GameProps, 'status'>): JSX.Element {
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

function Game(props: GameProps): JSX.Element {
  const { id } = props;
  const router = useRouter();
  const [state, setState] = useState<State>(props);
  async function openCell(col: number, row: number): Promise<void> {
    if (state.status !== 'OPEN') {
      return;
    }
    return fetch(`${process.env.API_BASE_URL}/game/${id}`, {
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
  function gotoList() {
    router.push('/');
  }
  return (
    <Fragment>
      <h1>Game: {id}</h1>
      <button onClick={gotoList}>Back to List</button>
      <Board {...state} onCell={openCell} />
      <GameStatus status={state.status} />
    </Fragment>
  );
}

function GamePage(props: Props): JSX.Element {
  if ('id' in props) {
    return <Game {...props} />;
  } else {
    return <ErrorPage statusCode={props.statusCode} />;
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const gameId = context.params?.gameId;
  const response = await fetch(`${process.env.API_BASE_URL}/game/${gameId}`);
  const props: GameResponse = response.ok
    ? await response.json()
    : {
        statusCode: response.status,
        message: '',
      };
  return { props };
};

export default GamePage;
