import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import agentRoutes from './routes/agent.routes';
import adminRoutes from './routes/admin.routes';
import exportRoutes from './routes/export.routes';
import authRoutes from './routes/auth.routes';
import { logger } from './middleware/logger';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const MONGO_URI = process.env.MONGO_URI || '';

/* ──────────────────────────────────────────────────────────────
   MongoDB Connection
────────────────────────────────────────────────────────────── */
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

/* ──────────────────────────────────────────────────────────────
   CORS
────────────────────────────────────────────────────────────── */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (FRONTEND_URL && origin === FRONTEND_URL) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

/* ──────────────────────────────────────────────────────────────
   Middleware
────────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

/* ──────────────────────────────────────────────────────────────
   Health Check
────────────────────────────────────────────────────────────── */
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Self-Refining Agentic AI Backend – T-78',
    status: 'running',
    version: '2.1.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: [
      'POST /auth/register',
      'POST /auth/login',
      'GET  /auth/me',
      'PUT  /auth/api-key',
      'POST /agent/goal',
      'GET  /agent/status',
      'GET  /agent/history',
      'GET  /agent/memory',
      'GET  /agent/memory/search?q=...',
      'GET  /agent/export/pdf/:id',
      'GET  /agent/export/docx/:id',
      'GET  /admin/logs',
      'DELETE /admin/logs',
    ],
  });
});

/* ──────────────────────────────────────────────────────────────
   Routes
────────────────────────────────────────────────────────────── */
app.use('/auth', authRoutes);
app.use('/agent', agentRoutes);
app.use('/agent/export', exportRoutes);
app.use('/admin', adminRoutes);

/* ──────────────────────────────────────────────────────────────
   404 Handler
────────────────────────────────────────────────────────────── */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

/* ──────────────────────────────────────────────────────────────
   Global Error Handler
────────────────────────────────────────────────────────────── */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

/* ──────────────────────────────────────────────────────────────
   Start Server
────────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`🌍 Allowed Origins: localhost + *.vercel.app ${FRONTEND_URL ? '+ ' + FRONTEND_URL : ''}`);
  console.log(`🤖 Groq Model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
});
