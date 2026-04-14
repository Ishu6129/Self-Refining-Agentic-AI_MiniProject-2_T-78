import { Router, Request, Response } from 'express';
import { runPipeline, getHistory, getMemoryStore, getStats } from '../orchestrator/pipeline';

const router = Router();

// ─── POST /agent/goal ─────────────────────────────────────────────────────────
router.post('/goal', async (req: Request, res: Response): Promise<void> => {
  const { goal } = req.body as { goal?: string };

  if (!goal || typeof goal !== 'string' || goal.trim().length < 5) {
    res.status(400).json({
      error: 'Please provide a valid goal (at least 5 characters).',
    });
    return;
  }

  console.log(`[API] New goal received: "${goal.substring(0, 60)}..."`);

  try {
    const result = await runPipeline(goal.trim());
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[API] Pipeline error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during pipeline execution.',
    });
  }
});

// ─── GET /agent/status ────────────────────────────────────────────────────────
router.get('/status', (_req: Request, res: Response): void => {
  const stats = getStats();
  res.status(200).json({
    success: true,
    status: 'operational',
    stats,
  });
});

// ─── GET /agent/history ───────────────────────────────────────────────────────
router.get('/history', (_req: Request, res: Response): void => {
  const history = getHistory();
  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});

// ─── GET /agent/memory ────────────────────────────────────────────────────────
router.get('/memory', (_req: Request, res: Response): void => {
  const memory = getMemoryStore();
  res.status(200).json({
    success: true,
    count: memory.length,
    data: memory.map((entry, idx) => ({
      id: `mem-${String(idx + 1).padStart(3, '0')}`,
      content: entry,
    })),
  });
});

export default router;
