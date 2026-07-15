import { Router } from 'express';
import db from '../database.js';

export const deliveryPersonsRouter = Router();

deliveryPersonsRouter.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM delivery_persons';
  const params: any[] = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY name ASC';
  res.json(db.prepare(sql).all(...params));
});

deliveryPersonsRouter.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM delivery_persons WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Delivery person not found' });
  res.json(p);
});

deliveryPersonsRouter.post('/', (req, res) => {
  const { name, phone, vehicle_number } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = db.prepare(
      'INSERT INTO delivery_persons (name, phone, vehicle_number) VALUES (?,?,?)'
    ).run(name.trim(), phone || null, vehicle_number || null);
    res.status(201).json({ id: result.lastInsertRowid, name: name.trim() });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

deliveryPersonsRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM delivery_persons WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Delivery person not found' });
  const { name, phone, vehicle_number, status } = req.body;
  try {
    db.prepare(
      "UPDATE delivery_persons SET name=?, phone=?, vehicle_number=?, status=?, updated_at=datetime('now') WHERE id=?"
    ).run(name ?? existing.name, phone ?? existing.phone, vehicle_number ?? existing.vehicle_number, status ?? existing.status, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

deliveryPersonsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM delivery_persons WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
