import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import agentRoutes from './src/routes/agent.routes';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allows local dev, a specific production Vercel URL, AND any Vercel preview URLs
const FRONTEND_URL = process.env.FRONTEND_URL || '';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Allow localhost during dev
    if (origin.startsWith('http://localhost')) return callback(null, true);

    // Allow any *.vercel.app URL (covers production + all preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Allow the explicit FRONTEND_URL env var (e.g. custom domain)
    if (FRONTEND_URL && origin === FRONTEND_URL) return callback(null, true);

    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Self-Refining Agentic AI Backend – T-78',
    status: 'running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: [
      'POST /agent/goal     – submit a goal and run the full pipeline',
      'GET  /agent/status   – system statistics',
      'GET  /agent/history  – all past execution records',
      'GET  /agent/memory   – memory store entries',
    ],
  });
});

// ─── Agent Routes ──────────────────────────────────────────────────────────────
app.use('/agent', agentRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Backend running on http://localhost:${PORT}`);
  console.log(`🌍  CORS: localhost + *.vercel.app${FRONTEND_URL ? ' + ' + FRONTEND_URL : ''}`);
  console.log(`🤖  Groq model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
});
