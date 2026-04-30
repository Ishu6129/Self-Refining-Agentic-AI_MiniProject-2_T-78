import { Router, Request, Response } from 'express';
import { runPipeline, getHistory, getMemoryStore, getStats } from '../orchestrator/pipeline';

const router = Router();

// ─── POST /agent/goal ─────────────────────────────────────────────────────────
router.post('/goal', async (req: Request, res: Response): Promise<void> => {
  const { goal, groqApiKey, userId } = req.body as {
    goal?: string;
    groqApiKey?: string;
    userId?: string;
  };
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  if (!goal || typeof goal !== 'string' || goal.trim().length < 5) {
    res.status(400).json({ error: 'Please provide a valid goal (at least 5 characters).' });
    return;
  }

  // Use custom key if provided, else pipeline falls back to env key
  const apiKey = groqApiKey && groqApiKey.trim() ? groqApiKey.trim() : undefined;
  console.log(`[API] New goal received: "${goal.substring(0, 60)}..." | Key: ${apiKey ? 'custom' : 'system'}`);

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const result = await runPipeline(userId, goal.trim(), apiKey, (event) => {
      res.write(JSON.stringify(event) + '\n');
    });
    res.write(JSON.stringify({ event: 'done', data: result }) + '\n');
    res.end();
  } catch (err: any) {
    console.error('[API] Pipeline error:', err.message);
    res.write(JSON.stringify({ event: 'error', error: err.message || 'Internal server error during pipeline execution.' }) + '\n');
    res.end();
  }
});

// ─── GET /agent/status ────────────────────────────────────────────────────────
router.get('/status/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  const { userId } = req.params;

  const stats = await getStats(userId);

  res.status(200).json({
    success: true,
    status: 'operational',
    stats
  });
});

// ─── GET /agent/history ───────────────────────────────────────────────────────
router.get('/history/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const history = await getHistory(userId);

  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
});

// ─── GET /agent/memory ────────────────────────────────────────────────────────
router.get('/memory/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  const memory = await getMemoryStore(userId);

  res.status(200).json({
    success: true,
    count: memory.length,
    data: memory
  });
});

// ─── GET /agent/memory/search ─────────────────────────────────────────────────
router.get('/memory/search/:userId', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { q } = req.query as { q?: string };

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: 'Provide a search query via ?q=...' });
    return;
  }
  const memory = await getMemoryStore(userId);

  const queryWords = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const scored = memory
    .map(entry => ({
      ...entry,
      score: entry.keywords.filter(k => queryWords.includes(k)).length,
    }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);

  res.status(200).json({
    success: true,
    count: scored.length,
    data: scored
  });
});

export default router;
