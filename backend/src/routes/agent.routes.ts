import { Router, Request, Response } from 'express';
import { runPipeline, getHistory, getMemoryStore, getStats } from '../orchestrator/pipeline';

const router = Router();

// ─── POST /agent/goal ─────────────────────────────────────────────────────────
// Submit a high-level goal and run the full Planner→Executor→Critic pipeline
router.post('/goal', async (req: Request, res: Response) => {
  const { goal } = req.body as { goal?: string };

  if (!goal || typeof goal !== 'string' || goal.trim().length < 5) {
    return res.status(400).json({
      error: 'Please provide a valid goal (at least 5 characters).',
    });
  }

  console.log(`[API] New goal received: "${goal.substring(0, 60)}..."`);

  try {
    const result = await runPipeline(goal.trim());
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[API] Pipeline error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during pipeline execution.',
    });
  }
});

// ─── GET /agent/status ────────────────────────────────────────────────────────
// Return system statistics (total runs, success rate, etc.)
router.get('/status', (_req: Request, res: Response) => {
  const stats = getStats();
  return res.status(200).json({
    success: true,
    status: 'operational',
    stats,
  });
});

// ─── GET /agent/history ───────────────────────────────────────────────────────
// Return past execution records (newest first)
router.get('/history', (_req: Request, res: Response) => {
  const history = getHistory();
  return res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});

// ─── GET /agent/memory ───────────────────────────────────────────────────────
// Return all memory entries extracted by the Memory Agent
router.get('/memory', (_req: Request, res: Response) => {
  const memory = getMemoryStore();
  return res.status(200).json({
    success: true,
    count: memory.length,
    data: memory.map((entry, idx) => ({
      id: `mem-${String(idx + 1).padStart(3, '0')}`,
      content: entry,
    })),
  });
});

export default router;
