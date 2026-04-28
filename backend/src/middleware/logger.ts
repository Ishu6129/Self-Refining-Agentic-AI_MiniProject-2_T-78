import { Request, Response, NextFunction } from 'express';
import Log from '../models/Log';

export async function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', async () => {
    await Log.create({
      ip: req.ip,
      route: req.originalUrl,
      method: req.method,
      goal: req.body?.goal || '',
      status: String(res.statusCode),
      responseTime: Date.now() - start
    });
  });
  next();
}