import { Either, left, right } from 'fp-ts/lib/Either';
import unfetch from 'isomorphic-unfetch';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import React, { useReducer, Fragment } from 'react';
import {
  ApiErrorResponse,
  GameListResponse,
  GameId,
  GameCreateResponse,
} from '../types';

const fetch = unfetch;

interface Props {
  gameIds: GameListResponse;
}

interface State {
  isLoading: boolean;
  error?: string;
}

interface GameLinkProps {
  gameId: GameId;
}

const INITIAL_STATE: State = {
  isLoading: false,
};

interface CreateGame {
  type: 'CREATE_GAME';
}

interface CreateGameSuccess {
  type: 'CREATE_GAME_SUCCESS';
}

interface CreateGameError {
  type: 'CREATE_GAME_ERROR';
  error: string;
}

type Action = CreateGame | CreateGameError | CreateGameSuccess;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CREATE_GAME':
      return { isLoading: true };
    case 'CREATE_GAME_SUCCESS':
      return { isLoading: false };
    case 'CREATE_GAME_ERROR':
      return { isLoading: false, error: action.error };
    default:
      return state;
  }
}

function GameLink(props: GameLinkProps): JSX.Element {
  const { gameId } = props;
  return (
    <Link href="/game/[gameId]" as={`/game/${gameId}`}>
      <a>{gameId}</a>
    </Link>
  );
}

async function createNewGame(
  rows: number,
  columns: number
): Promise<Either<ApiErrorResponse, GameCreateResponse>> {
  const response = await fetch(`${process.env.API_BASE_URL}/game`, {
    method: 'POST',
    body: JSON.stringify({ rows, columns }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    const result: GameCreateResponse = await response.json();
    return right(result);
  } else {
    const result: ApiErrorResponse = await response.json();
    return left(result);
  }
}

function Error(props: State): JSX.Element {
  const { error, isLoading } = props;
  if (!isLoading && typeof error === 'string') {
    return <p className="error">{error}</p>;
  } else {
    return <Fragment />;
  }
}

function GameList(props: Props): JSX.Element {
  const { gameIds } = props;
  if (gameIds.length === 0) {
    return <Fragment />;
  } else {
    return (
      <Fragment>
        <h2>Resume or View Existing Game</h2>
        <ol>
          {gameIds.map((gameId) => (
            <li key={gameId}>
              <GameLink gameId={gameId} />
            </li>
          ))}
        </ol>
      </Fragment>
    );
  }
}

const HomePage: NextPage<Props> = ({ gameIds }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  async function startNewGame() {
    dispatch({ type: 'CREATE_GAME' });
    const result = await createNewGame(5, 5);
    if (result._tag === 'Right') {
      // go to new game
      dispatch({ type: 'CREATE_GAME_SUCCESS' });
      router.push('/game/[gameId]', `/game/${result.right.id}`);
    } else {
      // show error message
      const error =
        result.left.error || result.left.message || 'Failed to create new game';
      dispatch({
        type: 'CREATE_GAME_ERROR',
        error,
      });
    }
  }
  return (
    <React.Fragment>
      <h1>Let&apos;s Play Minesweeper</h1>
      <Error {...state} />
      <button onClick={startNewGame} disabled={state.isLoading}>
        Start New Game
      </button>
      <GameList gameIds={gameIds} />
    </React.Fragment>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const response = await fetch(`${process.env.API_BASE_URL}/game`);
  const gameIds: GameListResponse = await response.json();
  const props: Props = {
    gameIds: response.ok ? gameIds : [],
  };
  return { props };
};

export default HomePage;
