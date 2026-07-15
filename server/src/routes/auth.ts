import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { generateToken, authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const allowedModules = JSON.parse(user.allowed_modules || '[]');
  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    allowed_modules: allowedModules,
  });
  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role, allowed_modules: allowedModules },
  });
});

// Get current user
router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json((req as any).user);
});

// List users (super admin only)
router.get('/users', authenticate, requireSuperAdmin, (_req: Request, res: Response) => {
  const users = db.prepare('SELECT id, username, role, allowed_modules, created_at FROM users ORDER BY id').all();
  res.json(users);
});

// Create user (super admin only)
router.post('/users', authenticate, requireSuperAdmin, (req: Request, res: Response) => {
  const { username, password, role, allowed_modules } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }
  const hashed = bcrypt.hashSync(password, 10);
  const modules = JSON.stringify(allowed_modules || []);
  const result = db.prepare('INSERT INTO users (username, password, role, allowed_modules) VALUES (?,?,?,?)').run(
    username, hashed, role || 'user', modules
  );
  const user = db.prepare('SELECT id, username, role, allowed_modules, created_at FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
  res.json(user);
});

// Update user (super admin only)
router.put('/users/:id', authenticate, requireSuperAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password, role, allowed_modules } = req.body;
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const updates: string[] = [];
  const values: any[] = [];
  if (username !== undefined) { updates.push('username = ?'); values.push(username); }
  if (role !== undefined) { updates.push('role = ?'); values.push(role); }
  if (allowed_modules !== undefined) { updates.push('allowed_modules = ?'); values.push(JSON.stringify(allowed_modules)); }
  if (password) {
    updates.push('password = ?');
    values.push(bcrypt.hashSync(password, 10));
  }
  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  const user = db.prepare('SELECT id, username, role, allowed_modules, created_at FROM users WHERE id = ?').get(id);
  res.json(user);
});

// Delete user (super admin only)
router.delete('/users/:id', authenticate, requireSuperAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
