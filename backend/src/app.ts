import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './db/database';
import { createAuthRouter } from './routes/auth.routes';

export function createApp(db?: DatabaseSync): Application {
  const app = express();
  const activeDb = db || getDatabase();

  app.use(cors());
  app.use(express.json());

  // Base route for health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth Routes
  app.use('/api/auth', createAuthRouter(activeDb));

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
}
