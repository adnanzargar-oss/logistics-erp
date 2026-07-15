import { Router } from 'express';
import db from '../database.js';

export const maintenanceRouter = Router();

maintenanceRouter.get('/', (req, res) => {
  const { vehicle_id } = req.query;
  let sql = `
    SELECT m.*, v.reg_number as vehicle_reg
    FROM maintenance_records m
    LEFT JOIN vehicles v ON m.vehicle_id = v.id
  `;
  const params: any[] = [];
  if (vehicle_id) {
    sql += ' WHERE m.vehicle_id = ?';
    params.push(vehicle_id);
  }
  sql += ' ORDER BY m.service_date DESC';
  res.json(db.prepare(sql).all(...params));
});

maintenanceRouter.get('/upcoming', (_req, res) => {
  const upcoming = db.prepare(`
    SELECT m.*, v.reg_number as vehicle_reg
    FROM maintenance_records m
    LEFT JOIN vehicles v ON m.vehicle_id = v.id
    WHERE m.next_service_date IS NOT NULL AND m.next_service_date >= date('now')
    ORDER BY m.next_service_date ASC
  `).all();
  res.json(upcoming);
});

maintenanceRouter.post('/', (req, res) => {
  const { vehicle_id, service_date, service_type, description, odometer_km, labor_cost, parts_cost, tax_amount, total_cost, provider_name, next_service_date, next_service_km } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO maintenance_records (vehicle_id, service_date, service_type, description, odometer_km, labor_cost, parts_cost, tax_amount, total_cost, provider_name, next_service_date, next_service_km)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(vehicle_id, service_date, service_type, description, odometer_km, labor_cost ?? 0, parts_cost ?? 0, tax_amount ?? 0, total_cost ?? ((labor_cost ?? 0) + (parts_cost ?? 0) + (tax_amount ?? 0)), provider_name, next_service_date, next_service_km);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

maintenanceRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM maintenance_records WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
