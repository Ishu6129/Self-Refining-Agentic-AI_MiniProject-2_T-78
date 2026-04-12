import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import agentRoutes from './src/routes/agent.routes';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allows both local React dev server AND the deployed Vercel frontend
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',      // set this in Render dashboard after deploying frontend
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Backend running on http://localhost:${PORT}`);
  console.log(`🌍  Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🤖  Groq model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
});
