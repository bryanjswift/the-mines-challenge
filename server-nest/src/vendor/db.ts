import { Client } from 'pg';

/**
 * Get a `Client` configured to talk to the database, but not connected.
 * @returns a configured `Client` instance.
 */
export function getClient(): Client {
  return new Client({
    connectionString: 'postgresql://root:root@localhost:5432/mines_db',
  });
}
