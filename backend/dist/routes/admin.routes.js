"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Log_1 = __importDefault(require("../models/Log"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Apply protection to all routes in this file
router.use(auth_middleware_1.authMiddleware);
router.use(admin_middleware_1.adminMiddleware);
// ─── GET /admin/logs ──────────────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
    const { ip, status, method, limit } = req.query;
    const filter = {};
    if (ip)
        filter.ip = String(ip);
    if (status)
        filter.status = String(status);
    if (method)
        filter.method = String(method).toUpperCase();
    const limitNum = Math.min(parseInt(String(limit || '500'), 10) || 500, 1000);
    try {
        const data = await Log_1.default.find(filter).sort({ createdAt: -1 }).limit(limitNum);
        res.json({ success: true, count: data.length, data });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// ─── DELETE /admin/logs  (clear all logs) ────────────────────────────────────
router.delete('/logs', async (_req, res) => {
    try {
        await Log_1.default.deleteMany({});
        res.json({ success: true, message: 'All logs cleared.' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map