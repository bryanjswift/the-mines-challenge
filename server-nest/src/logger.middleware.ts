import { Request, Response, NextFunction } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

/**
 * Measure and log the time spent to generate a response.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  /**
   * Time the execution of `next` in order to log it.
   * @param req incoming request.
   * @param res outgoing response.
   * @param next function called to pass control to the next middleware
   * function.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    next();
    Logger.debug(
      `Completed in ${Date.now() - start}ms`,
      `${req.method} ${req.path}`
    );
  }
}
