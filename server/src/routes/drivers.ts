import { Router } from 'express';
import db from '../database.js';

export const driversRouter = Router();

driversRouter.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT d.*, v.reg_number as vehicle_reg FROM drivers d LEFT JOIN vehicles v ON d.vehicle_id = v.id';
  const params: any[] = [];
  if (status) {
    sql += ' WHERE d.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY d.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

driversRouter.get('/:id', (req, res) => {
  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
  if (!driver) return res.status(404).json({ error: 'Driver not found' });
  res.json(driver);
});

driversRouter.post('/', (req, res) => {
  const { name, phone, email, license_number, license_expiry, emergency_contact, emergency_phone, address, vehicle_id } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO drivers (name, phone, email, license_number, license_expiry, emergency_contact, emergency_phone, address, vehicle_id) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(name, phone, email, license_number, license_expiry, emergency_contact, emergency_phone, address, vehicle_id || null);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

driversRouter.put('/:id', (req, res) => {
  const { name, phone, email, license_number, license_expiry, emergency_contact, emergency_phone, address, status, vehicle_id } = req.body;
  try {
    db.prepare(`
      UPDATE drivers SET name=?, phone=?, email=?, license_number=?, license_expiry=?, emergency_contact=?, emergency_phone=?, address=?, status=?, vehicle_id=?, updated_at=datetime('now')
      WHERE id=?
    `).run(name, phone, email, license_number, license_expiry, emergency_contact, emergency_phone, address, status, vehicle_id || null, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

driversRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM drivers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
