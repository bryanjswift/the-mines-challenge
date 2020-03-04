import { RequestHandler } from 'express';

/**
 * Wrap the given `RequestHandler` in a new `RequestHandler` that will catch
 * errors. In order to use `async/await` functions as handler functions that
 * properly propagate errors they need to be wrapped by this.
 * @param fn to be wrapped.
 * @returns a new function that deals with errors from `async/await` functions.
 */
export function createAsyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next): Promise<void> =>
    Promise.resolve(fn(req, res, next)).catch(next);
}
