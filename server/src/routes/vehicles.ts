import { Router } from 'express';
import db from '../database.js';

export const vehiclesRouter = Router();

vehiclesRouter.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT v.*, (SELECT COUNT(*) FROM bookings WHERE vehicle_id = v.id AND status = \'In Progress\') as active_trips FROM vehicles v';
  const params: any[] = [];
  if (status) {
    sql += ' WHERE v.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY v.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

vehiclesRouter.get('/:id', (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json(vehicle);
});

vehiclesRouter.post('/', (req, res) => {
  const { reg_number, type, model, year, chassis_number, fuel_type, capacity_kg, insurance_expiry, permit_expiry, fitness_expiry } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO vehicles (reg_number, type, model, year, chassis_number, fuel_type, capacity_kg, insurance_expiry, permit_expiry, fitness_expiry) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).run(reg_number, type ?? 'Truck', model, year, chassis_number, fuel_type ?? 'Diesel', capacity_kg, insurance_expiry, permit_expiry, fitness_expiry);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

vehiclesRouter.put('/:id', (req, res) => {
  const { reg_number, type, model, year, chassis_number, fuel_type, capacity_kg, status, insurance_expiry, permit_expiry, fitness_expiry } = req.body;
  try {
    db.prepare(`
      UPDATE vehicles SET reg_number=?, type=?, model=?, year=?, chassis_number=?, fuel_type=?, capacity_kg=?, status=?, insurance_expiry=?, permit_expiry=?, fitness_expiry=?, updated_at=datetime('now')
      WHERE id=?
    `).run(reg_number, type, model, year, chassis_number, fuel_type, capacity_kg, status, insurance_expiry, permit_expiry, fitness_expiry, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

vehiclesRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
