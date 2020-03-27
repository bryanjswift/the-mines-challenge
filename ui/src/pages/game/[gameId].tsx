import unfetch from 'isomorphic-unfetch';
import { NextPageContext } from 'next';
import React, { Fragment, useState } from 'react';
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

type Props = GameResponse;
type State = GameResponse;

function Board(props: BoardProps): JSX.Element {
  const { board, onCell } = props;
  return (
    <table>
      <tbody>
        {board.map((row, rowNumber) => (
          <tr key={rowNumber}>
            {row.map((cell, colNumber) => (
              <td
                key={`${rowNumber}:${colNumber}`}
                valign="middle"
                align="center"
                onClick={onCell.bind(null, colNumber, rowNumber)}
                style={{
                  height: '50px',
                  width: '50px',
                  border: '1px solid black',
                }}
              >
                {cell}
              </td>
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
      return (<h2>BOOM 💥</h2>);
    case 'WON':
      return (<h2>You did the thing! 🥳</h2>)
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
      })
    }).then((response) => response.json()).then((result: GameResponse) => setState(result))
  }
  return (
    <Fragment>
      <h1>Game: {id}</h1>
      <Board {...props} onCell={openCell} />
      <GameStatus status={state.status} />
    </Fragment>
  );
}

ShowGame.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  const { query } = ctx;
  const response = await fetch(`http://localhost:3000/game/${query.gameId}`);
  const result: GameResponse = await response.json();
  return result;
};

export default ShowGame;