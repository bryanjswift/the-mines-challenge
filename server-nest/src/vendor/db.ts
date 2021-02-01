import { Client, ClientConfig, Pool, PoolConfig } from 'pg';

const DEFAULT_CONFIG: ClientConfig = {
  connectionString: 'postgresql://root:root@localhost:5432/mines_db',
};

/**
 * Get a `Client` configured to talk to the database, but not connected.
 * @returns a configured `Client` instance.
 */
export function getClient(config?: ClientConfig): Client {
  return new Client(config ?? DEFAULT_CONFIG);
}

/**
 * Get a `Pool` configured to talk to the database, but not connected.
 * @returns a configured `Pool` instance.
 */
export function createClientPool(config?: PoolConfig): Pool {
  return new Pool(config ?? DEFAULT_CONFIG);
}
