"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables.');
}
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({ success: false, error: 'Username, email, and password are required.' });
        return;
    }
    if (username.trim().length < 3) {
        res.status(400).json({ success: false, error: 'Username must be at least 3 characters.' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
        return;
    }
    try {
        const existingUser = await User_1.default.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.trim() }] });
        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
            res.status(409).json({ success: false, error: `${field} already registered.` });
            return;
        }
        const user = new User_1.default({ username: username.trim(), email: email.toLowerCase(), password });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role },
        });
    }
    catch (err) {
        console.error('[AUTH] Register error:', err.message);
        res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
    }
    try {
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid email or password.' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, error: 'Invalid email or password.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                groqApiKey: user.groqApiKey ? '***stored***' : '',
                useCustomGroqKey: user.useCustomGroqKey,
                serperApiKey: user.serperApiKey ? '***stored***' : '',
                useCustomSerperKey: user.useCustomSerperKey,
            },
        });
    }
    catch (err) {
        console.error('[AUTH] Login error:', err.message);
        res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
    }
});
router.get('/me', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId).select('-password');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found.' });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                groqApiKey: user.groqApiKey ? '***stored***' : '',
                useCustomGroqKey: user.useCustomGroqKey,
                serperApiKey: user.serperApiKey ? '***stored***' : '',
                useCustomSerperKey: user.useCustomSerperKey,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.put('/api-key', auth_middleware_1.authMiddleware, async (req, res) => {
    const authReq = req;
    const { groqApiKey, useCustomGroqKey, serperApiKey, useCustomSerperKey } = authReq.body;
    try {
        const updateData = {};
        if (groqApiKey !== undefined)
            updateData.groqApiKey = groqApiKey;
        if (useCustomGroqKey !== undefined)
            updateData.useCustomGroqKey = Boolean(useCustomGroqKey);
        if (serperApiKey !== undefined)
            updateData.serperApiKey = serperApiKey;
        if (useCustomSerperKey !== undefined)
            updateData.useCustomSerperKey = Boolean(useCustomSerperKey);
        await User_1.default.findByIdAndUpdate(authReq.userId, updateData);
        res.status(200).json({ success: true, message: 'API key settings saved.' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map