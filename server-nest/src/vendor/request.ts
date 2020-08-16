import { Request as Req } from 'express';

/**
 * Implementation of Express request with a `user` property. This should have
 * been added by the passport types.
 */
export interface Request extends Req {
  /**
   * User property if authentication with passport has succeeded.
   */
  user?: unknown;
}
