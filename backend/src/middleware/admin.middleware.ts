import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from './auth.middleware';

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Access denied. Admins only.' });
      return;
    }
    next();
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Role verification failed.' });
  }
}
