import { Request, Response, Router } from 'express';
import { CatsService } from '../services/cats-service';
import { createAsyncHandler } from './async-request-handler';

const ONE_HOUR = 3600; // seconds

export function CatsRouter(path: string): Router {
  const router = Router();
  const service = new CatsService();

  async function getHandler(req: Request, res: Response): Promise<void> {
    const cats = service.list();
    res.append('Cache-Contro', `max-age=${ONE_HOUR}`).json(cats);
  }

  async function notAllowed(req: Request, res: Response): Promise<void> {
    res.status(405).send();
  }

  router
    .route(path)
    .get(createAsyncHandler(getHandler))
    .all(createAsyncHandler(notAllowed));

  return router;
}
