"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const agent_routes_1 = __importDefault(require("./routes/agent.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const logger_1 = require("./middleware/logger");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const MONGO_URI = process.env.MONGO_URI || '';
/* ──────────────────────────────────────────────────────────────
   MongoDB Connection
────────────────────────────────────────────────────────────── */
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Error:', err.message));
/* ──────────────────────────────────────────────────────────────
   CORS
────────────────────────────────────────────────────────────── */
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (origin.startsWith('http://localhost'))
            return callback(null, true);
        if (origin.endsWith('.vercel.app'))
            return callback(null, true);
        if (FRONTEND_URL && origin === FRONTEND_URL)
            return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
/* ──────────────────────────────────────────────────────────────
   Middleware
────────────────────────────────────────────────────────────── */
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_1.logger);
/* ──────────────────────────────────────────────────────────────
   Health Check
────────────────────────────────────────────────────────────── */
app.get('/', (_req, res) => {
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
app.use('/auth', auth_routes_1.default);
app.use('/agent', agent_routes_1.default);
app.use('/agent/export', export_routes_1.default);
app.use('/admin', admin_routes_1.default);
/* ──────────────────────────────────────────────────────────────
   404 Handler
────────────────────────────────────────────────────────────── */
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});
/* ──────────────────────────────────────────────────────────────
   Global Error Handler
────────────────────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
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
//# sourceMappingURL=app.js.map