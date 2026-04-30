import { Request, Response, NextFunction } from 'express';
import Log from '../models/Log';

export async function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Robust IP detection for cloud deployments
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket.remoteAddress || 'unknown';

  res.on('finish', async () => {
    try {
      await Log.create({
        ip: clientIp,
        route: req.originalUrl,
        method: req.method,
        goal: req.body?.goal || '',
        status: String(res.statusCode),
        responseTime: Date.now() - start
      });
    } catch (err) {
      // Silent fail for logging errors to prevent request hanging
    }
  });
  next();
}