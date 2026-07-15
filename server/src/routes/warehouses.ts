import { Router } from 'express';
import db from '../database.js';

export const warehousesRouter = Router();

warehousesRouter.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT
      w.*,
      (SELECT COUNT(*) FROM bookings WHERE pickup_warehouse_id = w.id) as pickup_bookings,
      (SELECT COUNT(*) FROM bookings WHERE delivery_warehouse_id = w.id) as delivery_bookings,
      (SELECT COUNT(*) FROM bookings WHERE pickup_warehouse_id = w.id OR delivery_warehouse_id = w.id) as total_bookings,
      (SELECT COUNT(DISTINCT l.id) FROM loadings l
        JOIN loading_items li ON li.loading_id = l.id
        JOIN bookings b ON b.id = li.booking_id
        WHERE b.pickup_warehouse_id = w.id) as total_loadings,
      (SELECT COUNT(*) FROM receivings WHERE warehouse_id = w.id) as total_receivings,
      (SELECT COALESCE(SUM(ri.bags_received), 0) FROM receivings r
        JOIN receiving_items ri ON ri.receiving_id = r.id
        WHERE r.warehouse_id = w.id) as total_nags_received,
      (SELECT COALESCE(SUM(ri.short_bags), 0) FROM receivings r
        JOIN receiving_items ri ON ri.receiving_id = r.id
        WHERE r.warehouse_id = w.id) as total_shortage,
      (SELECT COUNT(*) FROM deliveries d
        JOIN delivery_items di ON di.delivery_id = d.id
        JOIN bookings b ON b.id = di.booking_id
        WHERE b.delivery_warehouse_id = w.id) as total_deliveries
    FROM warehouses w ORDER BY w.created_at DESC
  `).all();
  res.json(rows);
});

warehousesRouter.post('/', (req, res) => {
  const { code, name, address, city, contact_person, phone, email } = req.body;
  try {
    if (code) {
      const exists = db.prepare('SELECT id FROM warehouses WHERE code = ?').get(code);
      if (exists) return res.status(400).json({ error: 'Warehouse code already exists' });
    }
    const result = db.prepare(
      'INSERT INTO warehouses (code, name, address, city, contact_person, phone, email) VALUES (?,?,?,?,?,?,?)'
    ).run(code || null, name, address, city, contact_person, phone, email);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

warehousesRouter.put('/:id', (req, res) => {
  const { code, name, address, city, contact_person, phone, email, status } = req.body;
  try {
    if (code) {
      const exists = db.prepare('SELECT id FROM warehouses WHERE code = ? AND id != ?').get(code, req.params.id);
      if (exists) return res.status(400).json({ error: 'Warehouse code already exists' });
    }
    db.prepare(
      'UPDATE warehouses SET code=?, name=?, address=?, city=?, contact_person=?, phone=?, email=?, status=? WHERE id=?'
    ).run(code || null, name, address, city, contact_person, phone, email, status ?? 'Active', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

warehousesRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM warehouses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
