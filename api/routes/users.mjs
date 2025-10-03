import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { turso } from '../_utils/tursoClient.mjs';
import { logApi, logError } from '../_utils/logger.mjs';
import { verifyToken } from '../_middleware/auth.mjs';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, email, password, address, phone, class: userClass } = req.body;
  if (!username || !email || !password || !address || !userClass) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  logApi('POST', '/api/users/register', `User: ${username}`);
  const tx = await turso.transaction('write');
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    await tx.execute({
      sql: 'INSERT INTO users (id, username, email, password, address, class, phone) VALUES (?, ?, ?, ?, ?, ?, ?);',
      args: [userId, username, email, hashedPassword, address, userClass, phone || null],
    });
    await tx.commit();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (e) {
    await tx.rollback();
    if (e && e.message && e.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    logError('DB ERROR', 'User registration failed', e && e.message);
    res.status(500).json({ message: 'Could not register user.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  logApi('POST', '/api/users/login', `User: ${username}`);
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

  const tx = await turso.transaction('read');
  try {
    const result = await tx.execute({
      sql: 'SELECT id, username, email, address, class, password, phone, isAdmin FROM users WHERE username = ?;',
      args: [username],
    });
    await tx.commit();
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const tokenPayload = { id: user.id, username: user.username, isAdmin: !!user.isAdmin };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        address: user.address,
        class: user.class,
        phone: user.phone,
        isAdmin: !!user.isAdmin,
      },
    });
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', 'User login failed', e && e.message);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  logApi('GET', '/api/users/me', `User: ${userId}`);
  const tx = await turso.transaction('read');
  try {
    const result = await tx.execute({
      sql: 'SELECT id, username, email, address, class, phone, isAdmin FROM users WHERE id = ?;',
      args: [userId],
    });
    await tx.commit();
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    const row = result.rows[0];
    res.json({ ...row, name: row.username });
  } catch (e) {
    await tx.rollback();
    logError('DB ERROR', 'Fetching profile for /me failed', e && e.message);
    res.status(500).json({ message: 'Could not fetch user profile.' });
  }
});

export default router;


