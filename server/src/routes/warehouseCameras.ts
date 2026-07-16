import { Router } from 'express';
import db from '../database.js';

export const camerasRouter = Router();

camerasRouter.get('/warehouses/:id/cameras', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM warehouse_cameras WHERE warehouse_id = ? ORDER BY sort_order, id'
  ).all(req.params.id);
  res.json(rows);
});

camerasRouter.post('/warehouses/:id/cameras', (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) {
    res.status(400).json({ error: 'Name and URL required' });
    return;
  }
  const maxOrder = db.prepare(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM warehouse_cameras WHERE warehouse_id = ?'
  ).get(req.params.id) as any;
  const result = db.prepare(
    'INSERT INTO warehouse_cameras (warehouse_id, name, url, sort_order) VALUES (?,?,?,?)'
  ).run(req.params.id, name, url, maxOrder.next);
  const cam = db.prepare('SELECT * FROM warehouse_cameras WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(cam);
});

camerasRouter.put('/warehouses/cameras/:id', (req, res) => {
  const { name, url, sort_order } = req.body;
  const existing = db.prepare('SELECT id FROM warehouse_cameras WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Camera not found' });
    return;
  }
  const updates: string[] = [];
  const values: any[] = [];
  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (url !== undefined) { updates.push('url = ?'); values.push(url); }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }
  if (updates.length > 0) {
    values.push(req.params.id);
    db.prepare(`UPDATE warehouse_cameras SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  const cam = db.prepare('SELECT * FROM warehouse_cameras WHERE id = ?').get(req.params.id);
  res.json(cam);
});

camerasRouter.delete('/warehouses/cameras/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM warehouse_cameras WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Camera not found' });
    return;
  }
  db.prepare('DELETE FROM warehouse_cameras WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
