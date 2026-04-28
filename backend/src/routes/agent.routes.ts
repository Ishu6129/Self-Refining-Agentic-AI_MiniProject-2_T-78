import { Router, Request, Response } from 'express';
import { runPipeline, getHistory, getMemoryStore, getStats } from '../orchestrator/pipeline';

const router = Router();

// ─── POST /agent/goal ─────────────────────────────────────────────────────────
router.post('/goal', async (req: Request, res: Response): Promise<void> => {
  const { goal, groqApiKey } = req.body as { goal?: string; groqApiKey?: string };

  if (!goal || typeof goal !== 'string' || goal.trim().length < 5) {
    res.status(400).json({ error: 'Please provide a valid goal (at least 5 characters).' });
    return;
  }

  // Use custom key if provided, else pipeline falls back to env key
  const apiKey = groqApiKey && groqApiKey.trim() ? groqApiKey.trim() : undefined;
  console.log(`[API] New goal received: "${goal.substring(0, 60)}..." | Key: ${apiKey ? 'custom' : 'system'}`);

  try {
    const result = await runPipeline(goal.trim(), apiKey);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    console.error('[API] Pipeline error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Internal server error during pipeline execution.' });
  }
});

// ─── GET /agent/status ────────────────────────────────────────────────────────
router.get('/status', (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, status: 'operational', stats: getStats() });
});

// ─── GET /agent/history ───────────────────────────────────────────────────────
router.get('/history', (_req: Request, res: Response): void => {
  const history = getHistory();
  res.status(200).json({ success: true, count: history.length, data: history });
});

// ─── GET /agent/memory ────────────────────────────────────────────────────────
router.get('/memory', (_req: Request, res: Response): void => {
  const memory = getMemoryStore();
  res.status(200).json({
    success: true,
    count: memory.length,
    data: memory.map(entry => ({
      id:        entry.id,
      content:   entry.content,
      timestamp: entry.timestamp,
      keywords:  entry.keywords,
    })),
  });
});

// ─── GET /agent/memory/search ─────────────────────────────────────────────────
router.get('/memory/search', (req: Request, res: Response): void => {
  const { q } = req.query as { q?: string };
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: 'Provide a search query via ?q=...' });
    return;
  }
  const memory = getMemoryStore();
  const queryWords = q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const scored = memory
    .map(entry => {
      const score = entry.keywords.filter(k => queryWords.includes(k)).length;
      return { ...entry, score };
    })
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);
  res.status(200).json({ success: true, count: scored.length, data: scored });
});

export default router;
