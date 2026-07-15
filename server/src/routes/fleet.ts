import { Router } from 'express';
import db from '../database.js';

export const fleetRouter = Router();

fleetRouter.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT
      v.*,
      d.id as driver_id,
      d.name as driver_name,
      d.phone as driver_phone,
      d.email as driver_email,
      d.license_number as driver_license,
      d.license_expiry as driver_license_expiry,
      d.emergency_contact as driver_emergency_contact,
      d.emergency_phone as driver_emergency_phone,
      d.address as driver_address,
      d.status as driver_status
    FROM vehicles v
    LEFT JOIN drivers d ON d.vehicle_id = v.id
    ORDER BY v.created_at DESC
  `).all();
  res.json(rows);
});

fleetRouter.put('/:id', (req, res) => {
  const vehicleId = req.params.id;
  const {
    reg_number, type, model, year, chassis_number, fuel_type, capacity_kg,
    status, insurance_expiry, permit_expiry, fitness_expiry,
    driver_id, driver_name, driver_phone, driver_email, driver_license,
    driver_license_expiry, driver_emergency_contact, driver_emergency_phone,
    driver_address, driver_status,
  } = req.body;

  try {
    db.prepare(`
      UPDATE vehicles SET reg_number=?, type=?, model=?, year=?, chassis_number=?,
        fuel_type=?, capacity_kg=?, status=?, insurance_expiry=?, permit_expiry=?,
        fitness_expiry=?, updated_at=datetime('now')
      WHERE id=?
    `).run(reg_number, type, model, year || null, chassis_number, fuel_type,
      capacity_kg || null, status || 'Active', insurance_expiry || null,
      permit_expiry || null, fitness_expiry || null, vehicleId);

    if (driver_id) {
      const existing = db.prepare('SELECT id FROM drivers WHERE id = ?').get(driver_id) as any;
      if (existing) {
        db.prepare(`
          UPDATE drivers SET name=?, phone=?, email=?, license_number=?,
            license_expiry=?, emergency_contact=?, emergency_phone=?, address=?,
            status=?, updated_at=datetime('now')
          WHERE id=?
        `).run(driver_name, driver_phone, driver_email, driver_license,
          driver_license_expiry || null, driver_emergency_contact,
          driver_emergency_phone, driver_address, driver_status || 'Active', driver_id);
      }
    } else if (driver_name) {
      const result = db.prepare(`
        INSERT INTO drivers (name, phone, email, license_number, license_expiry,
          emergency_contact, emergency_phone, address, status, vehicle_id)
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `).run(driver_name, driver_phone, driver_email, driver_license,
        driver_license_expiry || null, driver_emergency_contact,
        driver_emergency_phone, driver_address, driver_status || 'Active', vehicleId);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
