import { Router, Request, Response } from 'express';
import Log from '../models/Log';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Apply protection to all routes in this file
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

// ─── GET /admin/logs ──────────────────────────────────────────────────────────
router.get('/logs', async (req: Request, res: Response): Promise<void> => {
  const { ip, status, method, limit } = req.query;

  const filter: Record<string, any> = {};
  if (ip)     filter.ip = String(ip);
  if (status) filter.status = String(status);
  if (method) filter.method = String(method).toUpperCase();

  const limitNum = Math.min(parseInt(String(limit || '500'), 10) || 500, 1000);

  try {
    const data = await Log.find(filter).sort({ createdAt: -1 }).limit(limitNum);
    res.json({ success: true, count: data.length, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /admin/logs  (clear all logs) ────────────────────────────────────
router.delete('/logs', async (_req: Request, res: Response): Promise<void> => {
  try {
    await Log.deleteMany({});
    res.json({ success: true, message: 'All logs cleared.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
