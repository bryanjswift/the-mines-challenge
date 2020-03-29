import unfetch from 'isomorphic-unfetch';
import { NextPage, GetServerSideProps } from 'next';
import Link from 'next/link';
import React from 'react';
import { GameListResponse, GameId } from '../types';

const fetch = unfetch;

interface Props {
  gameIds: GameListResponse;
}

interface GameLinkProps {
  gameId: GameId;
}

function GameLink(props: GameLinkProps): JSX.Element {
  const { gameId } = props;
  return (
    <Link href="/game/[gameId]" as={`/game/${gameId}`}>
      {gameId}
    </Link>
  );
}

const HomePage: NextPage<Props> = ({ gameIds }) => (
  <React.Fragment>
    <h1>Let&apos;s Play Minesweeper</h1>
    <ol>
      {gameIds.map((gameId) => (
        <li key={gameId}>
          <GameLink gameId={gameId} />
        </li>
      ))}
    </ol>
  </React.Fragment>
);

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const response = await fetch(`${process.env.API_BASE_URL}/game`);
  const gameIds: GameListResponse = await response.json();
  const props: Props = {
    gameIds: response.ok ? gameIds : [],
  };
  return { props };
};

export default HomePage;
