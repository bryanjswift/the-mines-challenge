import * as dotenv from 'dotenv';

// Perform `dotconfig` setup.
dotenv.config();

/**
 * Pull in environment variables from `.env` files. This is a function to call
 * in order to avoid warnings about importing but not using.
 * @see dotconfig
 */
export function ensureEnv() {
  dotenv.config();
}
