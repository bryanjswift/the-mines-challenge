import { Request, Response, NextFunction } from 'express';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    Logger.debug('Start', req.path);
    next();
    Logger.debug('Stop', req.path);
  }
}
