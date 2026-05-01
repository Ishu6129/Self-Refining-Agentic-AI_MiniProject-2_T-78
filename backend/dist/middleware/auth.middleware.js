"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('❌ JWT_SECRET is not set in environment variables. Please add it to your .env file.');
}
const authMiddleware = (req, res, next) => {
    const authReq = req;
    const authHeader = authReq.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'No token provided. Please login.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        authReq.userId = decoded.userId;
        authReq.userEmail = decoded.email;
        next();
    }
    catch (err) {
        res.status(401).json({ success: false, error: 'Invalid or expired token. Please login again.' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map