import { Router } from 'express';
import db from '../database.js';

export const loadingsRouter = Router();

// List all loadings with vehicle/driver info
loadingsRouter.get('/', (_req, res) => {
  const list = db.prepare(`
    SELECT l.*, v.reg_number as vehicle_reg, d.name as driver_name, d.license_number,
           (SELECT COUNT(*) FROM loading_items WHERE loading_id = l.id) as item_count
    FROM loadings l
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    LEFT JOIN drivers d ON l.driver_id = d.id
    ORDER BY l.created_at DESC
  `).all() as any[];

  // Attach booking details to each loading
  const result = list.map((l) => {
    const items = db.prepare(`
      SELECT b.id, b.booking_no, b.consignor_name, b.consignee_name, b.from_location, b.to_location,
             b.num_bags, b.actual_weight, b.charged_weight, b.eway_bill_no,
             b.freight, b.grand_total, b.received
      FROM loading_items li
      JOIN bookings b ON li.booking_id = b.id
      WHERE li.loading_id = ?
    `).all(l.id);
    return { ...l, bookings: items };
  });

  res.json(result);
});

// Search loadings by loading_no for receiving
loadingsRouter.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const list = db.prepare(`
    SELECT l.*, v.reg_number as vehicle_reg, d.name as driver_name, d.phone as driver_phone, d.license_number,
           (SELECT COUNT(*) FROM loading_items WHERE loading_id = l.id) as item_count
    FROM loadings l
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    LEFT JOIN drivers d ON l.driver_id = d.id
    WHERE l.loading_no LIKE ?
    ORDER BY l.created_at DESC
  `).all(`%${q}%`) as any[];

  const result = list.map((l) => {
    const items = db.prepare(`
      SELECT b.id, b.booking_no, b.consignor_name, b.consignee_name, b.from_location, b.to_location,
             b.num_bags, b.actual_weight, b.charged_weight, b.eway_bill_no,
             b.freight, b.grand_total, b.received
      FROM loading_items li
      JOIN bookings b ON li.booking_id = b.id
      WHERE li.loading_id = ?
    `).all(l.id);
    return { ...l, bookings: items };
  });

  res.json(result);
});

// Get single loading detail
loadingsRouter.get('/:id', (req, res) => {
  const loading = db.prepare(`
    SELECT l.*, v.reg_number as vehicle_reg, v.type as vehicle_type,
           d.name as driver_name, d.phone as driver_phone, d.license_number
    FROM loadings l
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    LEFT JOIN drivers d ON l.driver_id = d.id
    WHERE l.id = ?
  `).get(req.params.id) as any;
  if (!loading) return res.status(404).json({ error: 'Loading not found' });

  loading.bookings = db.prepare(`
    SELECT b.id, b.booking_no, b.consignor_name, b.consignor_address, b.consignor_gstin,
           b.consignee_name, b.consignee_address, b.consignee_gstin, b.consignee_delivery_address,
           b.from_location, b.to_location, b.lr_date,
           b.num_bags, b.type_of_packing, b.said_to_contain, b.actual_weight, b.charged_weight, b.private_marka,
           b.material_invoice_no, b.material_invoice_date, b.material_invoice_amt,
           b.freight, b.eway_bill_charges, b.door_delivery, b.consignment_charges, b.other_charges,
           b.total_charges, b.discount, b.grand_total,
           b.eway_bill_no, b.eway_expiry_date
    FROM loading_items li
    JOIN bookings b ON li.booking_id = b.id
    WHERE li.loading_id = ?
  `).all(req.params.id);

  res.json(loading);
});

// Create a new loading with booking items
loadingsRouter.post('/', (req, res) => {
  const { vehicle_id, driver_id, loading_date, booking_ids } = req.body;
  const loadingNo = 'LD-' + Date.now().toString(36).toUpperCase();
  try {
    const result = db.prepare(
      'INSERT INTO loadings (loading_no, vehicle_id, driver_id, loading_date) VALUES (?,?,?,?)'
    ).run(loadingNo, vehicle_id, driver_id || null, loading_date);

    const loadingId = result.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO loading_items (loading_id, booking_id) VALUES (?, ?)');

    if (Array.isArray(booking_ids)) {
      for (const bid of booking_ids) {
        insertItem.run(loadingId, bid);
        db.prepare('UPDATE bookings SET loaded = 1 WHERE id = ?').run(bid);
      }
    }

    res.status(201).json({ id: loadingId, loading_no: loadingNo });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Delete loading (unload)
loadingsRouter.delete('/:id', (req, res) => {
  try {
    const items = db.prepare('SELECT booking_id FROM loading_items WHERE loading_id = ?').all(req.params.id) as any[];
    for (const item of items) {
      db.prepare('UPDATE bookings SET loaded = 0 WHERE id = ?').run(item.booking_id);
    }
    db.prepare('DELETE FROM loading_items WHERE loading_id = ?').run(req.params.id);
    db.prepare('DELETE FROM loadings WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
