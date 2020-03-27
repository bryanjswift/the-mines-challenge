import unfetch from 'isomorphic-unfetch';
import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';
import { GameListResponse, GameId } from '../types';

const fetch = unfetch;

interface Props {
  gameIds: GameListResponse;
  userAgent: string;
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

const Home: NextPage<Props> = ({ gameIds }: Props) => (
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

Home.getInitialProps = async ({ req }): Promise<Props> => {
  const response = await fetch('http://localhost:3000/game');
  const result: GameListResponse = await response.json();
  const userAgent = req ? req.headers['user-agent'] || '' : navigator.userAgent;
  return {
    gameIds: result || [],
    userAgent
  };
};

export default Home;
