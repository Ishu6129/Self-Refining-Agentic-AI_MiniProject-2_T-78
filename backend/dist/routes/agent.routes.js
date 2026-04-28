"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pipeline_1 = require("../orchestrator/pipeline");
const router = (0, express_1.Router)();
// ─── POST /agent/goal ─────────────────────────────────────────────────────────
router.post('/goal', async (req, res) => {
    const { goal, groqApiKey } = req.body;
    if (!goal || typeof goal !== 'string' || goal.trim().length < 5) {
        res.status(400).json({ error: 'Please provide a valid goal (at least 5 characters).' });
        return;
    }
    // Use custom key if provided, else pipeline falls back to env key
    const apiKey = groqApiKey && groqApiKey.trim() ? groqApiKey.trim() : undefined;
    console.log(`[API] New goal received: "${goal.substring(0, 60)}..." | Key: ${apiKey ? 'custom' : 'system'}`);
    try {
        const result = await (0, pipeline_1.runPipeline)(goal.trim(), apiKey);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        console.error('[API] Pipeline error:', err.message);
        res.status(500).json({ success: false, error: err.message || 'Internal server error during pipeline execution.' });
    }
});
// ─── GET /agent/status ────────────────────────────────────────────────────────
router.get('/status', (_req, res) => {
    res.status(200).json({ success: true, status: 'operational', stats: (0, pipeline_1.getStats)() });
});
// ─── GET /agent/history ───────────────────────────────────────────────────────
router.get('/history', (_req, res) => {
    const history = (0, pipeline_1.getHistory)();
    res.status(200).json({ success: true, count: history.length, data: history });
});
// ─── GET /agent/memory ────────────────────────────────────────────────────────
router.get('/memory', (_req, res) => {
    const memory = (0, pipeline_1.getMemoryStore)();
    res.status(200).json({
        success: true,
        count: memory.length,
        data: memory.map(entry => ({
            id: entry.id,
            content: entry.content,
            timestamp: entry.timestamp,
            keywords: entry.keywords,
        })),
    });
});
// ─── GET /agent/memory/search ─────────────────────────────────────────────────
router.get('/memory/search', (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        res.status(400).json({ error: 'Provide a search query via ?q=...' });
        return;
    }
    const memory = (0, pipeline_1.getMemoryStore)();
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
exports.default = router;
//# sourceMappingURL=agent.routes.js.map