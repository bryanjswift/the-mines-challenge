import unfetch from 'isomorphic-unfetch';
import { GetServerSideProps } from 'next';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import React, {
  Fragment,
  MouseEvent,
  PropsWithChildren,
  useState,
} from 'react';
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

interface CellInteractProps {
  column: number;
  row: number;
  flag?: boolean;
}

interface BoardProps extends Pick<GameResponse, 'board'> {
  onCellInteract: (interactProps: CellInteractProps) => void;
}

interface CellProps {
  column: number;
  row: number;
  onCellInteract: (interactProps: CellInteractProps) => void;
}

type Props = GameResponse | ErrorResponse;
type State = GameResponse;

function Cell(props: PropsWithChildren<CellProps>): JSX.Element {
  const { column, row, children, onCellInteract } = props;
  function onCellClick(e: MouseEvent<HTMLElement>): void {
    onCellInteract({
      column,
      row,
      flag: e.getModifierState('Alt') || e.getModifierState('Control'),
    });
  }
  return (
    <td
      key={`${row}:${column}`}
      valign="middle"
      align="center"
      onClick={onCellClick}
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
  const { board, onCellInteract } = props;
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
                onCellInteract={onCellInteract}
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
  async function onCellInteract(
    interactProps: CellInteractProps
  ): Promise<void> {
    if (state.status !== 'OPEN') {
      return;
    }
    const { column: col, row } = interactProps;
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
      <Board {...state} onCellInteract={onCellInteract} />
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
