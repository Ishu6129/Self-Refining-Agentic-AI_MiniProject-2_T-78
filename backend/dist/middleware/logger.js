"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
const Log_1 = __importDefault(require("../models/Log"));
async function logger(req, res, next) {
    const start = Date.now();
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.ip
        || req.socket.remoteAddress
        || 'unknown';
    // ::1 = IPv6 loopback, ::ffff: prefix = IPv4-mapped IPv6
    const clientIp = rawIp === '::1'
        ? '127.0.0.1'
        : rawIp.startsWith('::ffff:')
            ? rawIp.replace('::ffff:', '')
            : rawIp;
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
        catch { }
    });
    next();
}
//# sourceMappingURL=logger.js.map