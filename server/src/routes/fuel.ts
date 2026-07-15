import { Router } from 'express';
import db from '../database.js';

export const fuelRouter = Router();

fuelRouter.get('/', (req, res) => {
  const { vehicle_id } = req.query;
  let sql = `
    SELECT f.*, v.reg_number as vehicle_reg
    FROM fuel_entries f
    LEFT JOIN vehicles v ON f.vehicle_id = v.id
  `;
  const params: any[] = [];
  if (vehicle_id) {
    sql += ' WHERE f.vehicle_id = ?';
    params.push(vehicle_id);
  }
  sql += ' ORDER BY f.fuel_date DESC, f.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

fuelRouter.get('/summary', (_req, res) => {
  const summary = db.prepare(`
    SELECT v.id, v.reg_number,
      COUNT(f.id) as refills,
      COALESCE(SUM(f.quantity_ltr), 0) as total_liters,
      COALESCE(SUM(f.total_cost), 0) as total_cost,
      COALESCE(AVG(f.cost_per_ltr), 0) as avg_cost_per_ltr
    FROM vehicles v
    LEFT JOIN fuel_entries f ON v.id = f.vehicle_id
    GROUP BY v.id
  `).all();
  res.json(summary);
});

fuelRouter.post('/', (req, res) => {
  const { vehicle_id, fuel_date, quantity_ltr, cost_per_ltr, total_cost, odometer_km, station_name, payment_type, paid_by, notes } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO fuel_entries (vehicle_id, fuel_date, quantity_ltr, cost_per_ltr, total_cost, odometer_km, station_name, payment_type, paid_by, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(vehicle_id, fuel_date, quantity_ltr, cost_per_ltr, total_cost ?? (quantity_ltr * cost_per_ltr), odometer_km, station_name, payment_type ?? 'Cash', paid_by ?? 'Company', notes);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

fuelRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM fuel_entries WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
