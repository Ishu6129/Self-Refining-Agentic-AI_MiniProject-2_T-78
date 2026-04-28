"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
const Log_1 = __importDefault(require("../models/Log"));
async function logger(req, res, next) {
    const start = Date.now();
    res.on('finish', async () => {
        await Log_1.default.create({
            ip: req.ip,
            route: req.originalUrl,
            method: req.method,
            goal: req.body?.goal || '',
            status: String(res.statusCode),
            responseTime: Date.now() - start
        });
    });
    next();
}
//# sourceMappingURL=logger.js.map