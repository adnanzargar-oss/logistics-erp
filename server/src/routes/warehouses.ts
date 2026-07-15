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

warehousesRouter.get('/:id/monthly-report', (req, res) => {
  const { month } = req.query;
  const monthStr = (month as string) || new Date().toISOString().slice(0, 7);
  const warehouse = db.prepare('SELECT * FROM warehouses WHERE id = ?').get(req.params.id) as any;
  if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });

  const daysInMonth = new Date(Number(monthStr.split('-')[0]), Number(monthStr.split('-')[1]), 0).getDate();

  const dailyReport: any[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
    const loadings = db.prepare(`
      SELECT COUNT(DISTINCT l.id) as count FROM loadings l
      JOIN loading_items li ON li.loading_id = l.id
      JOIN bookings b ON b.id = li.booking_id
      WHERE b.pickup_warehouse_id = ? AND l.loading_date = ?
    `).get(req.params.id, dateStr) as any;

    const receivings = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(ri.bags_received), 0) as nags_received, COALESCE(SUM(ri.short_bags), 0) as shortage
      FROM receivings r
      JOIN receiving_items ri ON ri.receiving_id = r.id
      WHERE r.warehouse_id = ? AND r.receiving_date = ?
    `).get(req.params.id, dateStr) as any;

    const deliveries = db.prepare(`
      SELECT COUNT(DISTINCT d.id) as count FROM deliveries d
      JOIN delivery_items di ON di.delivery_id = d.id
      JOIN bookings b ON b.id = di.booking_id
      WHERE b.delivery_warehouse_id = ? AND d.delivery_date = ?
    `).get(req.params.id, dateStr) as any;

    dailyReport.push({
      date: dateStr,
      loadings: loadings?.count || 0,
      receivings: receivings?.count || 0,
      nags_received: receivings?.nags_received || 0,
      shortage: receivings?.shortage || 0,
      deliveries: deliveries?.count || 0,
    });
  }

  const totals = dailyReport.reduce((acc, d) => ({
    loadings: acc.loadings + d.loadings,
    receivings: acc.receivings + d.receivings,
    nags_received: acc.nags_received + d.nags_received,
    shortage: acc.shortage + d.shortage,
    deliveries: acc.deliveries + d.deliveries,
  }), { loadings: 0, receivings: 0, nags_received: 0, shortage: 0, deliveries: 0 });

  res.json({
    warehouse,
    month: monthStr,
    dailyReport,
    totals,
  });
});
