import * as dotenv from 'dotenv';
import { start as apmStart } from 'elastic-apm-node';

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

// Add this to the VERY top of the first file loaded in your app
export const apm: ReturnType<typeof apmStart> = apmStart({
  // Opt in to APM services
  active: process.env.APM_SERVICE_ENABLED === 'true',
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: process.env.APM_SERVICE_NAME,
  // Use if APM Server requires a token
  secretToken: process.env.APM_SERVICE_TOKEN,
  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: process.env.APM_SERVICE_URL,
});
