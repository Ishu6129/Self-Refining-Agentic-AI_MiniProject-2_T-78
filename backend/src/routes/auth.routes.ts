import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agentic-ai-secret-key-change-in-prod';

/* ──────────────────────────────────────────────────────────────
   POST /auth/register
────────────────────────────────────────────────────────────── */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
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
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.trim() }] });
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      res.status(409).json({ success: false, error: `${field} already registered.` });
      return;
    }

    const user = new User({ username: username.trim(), email: email.toLowerCase(), password });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err: any) {
    console.error('[AUTH] Register error:', err.message);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

/* ──────────────────────────────────────────────────────────────
   POST /auth/login
────────────────────────────────────────────────────────────── */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required.' });
    return;
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        groqApiKey: user.groqApiKey ? '***stored***' : '',
        useCustomGroqKey: user.useCustomGroqKey,
      },
    });
  } catch (err: any) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

/* ──────────────────────────────────────────────────────────────
   GET /auth/me  (protected)
────────────────────────────────────────────────────────────── */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
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
        groqApiKey: user.groqApiKey ? '***stored***' : '',
        useCustomGroqKey: user.useCustomGroqKey,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ──────────────────────────────────────────────────────────────
   PUT /auth/api-key  (protected) — save user's Groq key
────────────────────────────────────────────────────────────── */
router.put('/api-key', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { groqApiKey, useCustomGroqKey } = req.body;

  try {
    await User.findByIdAndUpdate(req.userId, {
      groqApiKey: groqApiKey || '',
      useCustomGroqKey: Boolean(useCustomGroqKey),
    });
    res.status(200).json({ success: true, message: 'API key settings saved.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
