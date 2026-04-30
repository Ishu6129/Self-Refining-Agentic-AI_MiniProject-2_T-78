"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
const Log_1 = __importDefault(require("../models/Log"));
async function logger(req, res, next) {
    const start = Date.now();
    // Robust IP detection for cloud deployments
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.socket.remoteAddress || 'unknown';
    res.on('finish', async () => {
        try {
            await Log_1.default.create({
                ip: clientIp,
                route: req.originalUrl,
                method: req.method,
                goal: req.body?.goal || '',
                status: String(res.statusCode),
                responseTime: Date.now() - start
            });
        }
        catch (err) {
            // Silent fail for logging errors to prevent request hanging
        }
    });
    next();
}
//# sourceMappingURL=logger.js.map