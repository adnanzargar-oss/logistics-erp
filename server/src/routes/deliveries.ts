import { Router } from 'express';
import db from '../database.js';

export const deliveriesRouter = Router();

deliveriesRouter.get('/', (_req, res) => {
  const list = db.prepare(`
    SELECT d.*, dp.name as delivery_person_name, dp.phone as delivery_person_phone, dp.vehicle_number as delivery_person_vehicle,
           (SELECT COUNT(*) FROM delivery_items WHERE delivery_id = d.id) as item_count
    FROM deliveries d
    LEFT JOIN delivery_persons dp ON d.delivery_person_id = dp.id
    ORDER BY d.created_at DESC
  `).all() as any[];

  const result = list.map((d) => {
    const items = db.prepare(`
      SELECT b.id, b.booking_no, b.consignor_name, b.consignor_address, b.consignor_contact,
             b.consignee_name, b.consignee_address, b.consignee_contact, b.consignee_delivery_address,
             b.from_location, b.to_location, b.num_bags, b.type_of_packing, b.said_to_contain,
             b.actual_weight, b.charged_weight, b.private_marka,
             b.eway_bill_no, b.eway_expiry_date, b.lr_date,
             b.freight, b.total_charges, b.discount, b.grand_total
      FROM delivery_items di
      JOIN bookings b ON di.booking_id = b.id
      WHERE di.delivery_id = ?
    `).all(d.id);
    return { ...d, bookings: items };
  });

  res.json(result);
});

deliveriesRouter.get('/:id', (req, res) => {
  const delivery = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(req.params.id) as any;
  if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

  delivery.bookings = db.prepare(`
    SELECT b.id, b.booking_no, b.consignor_name, b.consignor_address, b.consignor_contact,
           b.consignee_name, b.consignee_address, b.consignee_contact, b.consignee_delivery_address,
           b.from_location, b.to_location, b.num_bags, b.type_of_packing, b.said_to_contain,
           b.actual_weight, b.charged_weight, b.private_marka,
           b.eway_bill_no, b.eway_expiry_date, b.lr_date,
           b.freight, b.total_charges, b.discount, b.grand_total,
           di.pod_photo, di.delivered_at
    FROM delivery_items di
    JOIN bookings b ON di.booking_id = b.id
    WHERE di.delivery_id = ?
  `).all(req.params.id);

  res.json(delivery);
});

deliveriesRouter.post('/', (req, res) => {
  const { delivery_date, delivery_person_id, booking_ids, delivery_person_name, delivery_person_phone, delivery_person_vehicle } = req.body;
  const deliveryNo = 'DLV-' + Date.now().toString(36).toUpperCase();
  try {
    const result = db.prepare(
      'INSERT INTO deliveries (delivery_no, delivery_date, delivery_person_id) VALUES (?,?,?)'
    ).run(deliveryNo, delivery_date, delivery_person_id || null);

    const deliveryId = result.lastInsertRowid;
    const insertItem = db.prepare('INSERT INTO delivery_items (delivery_id, booking_id) VALUES (?, ?)');

    if (Array.isArray(booking_ids)) {
      for (const bid of booking_ids) {
        insertItem.run(deliveryId, bid);
        db.prepare('UPDATE bookings SET out_for_delivery = 1 WHERE id = ?').run(bid);
      }
    }

    res.status(201).json({ id: deliveryId, delivery_no: deliveryNo });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Confirm delivery - mark selected bookings as delivered, unselected go back
deliveriesRouter.put('/:id/confirm', (req, res) => {
  const { delivered_ids, pod_photos } = req.body;
  try {
    const items = db.prepare('SELECT id, booking_id FROM delivery_items WHERE delivery_id = ?').all(req.params.id) as any[];
    for (const item of items) {
      if (Array.isArray(delivered_ids) && delivered_ids.includes(item.booking_id)) {
        const photo = pod_photos?.[item.booking_id] || null;
        db.prepare("UPDATE delivery_items SET pod_photo = ?, delivered_at = datetime('now') WHERE id = ?").run(photo, item.id);
        db.prepare('UPDATE bookings SET delivered = 1, out_for_delivery = 0 WHERE id = ?').run(item.booking_id);
      } else {
        db.prepare('UPDATE bookings SET out_for_delivery = 0 WHERE id = ?').run(item.booking_id);
      }
    }
    db.prepare("UPDATE deliveries SET status = 'Delivered' WHERE id = ?").run(req.params.id);
    const full = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(req.params.id) as any;
    full.bookings = db.prepare(`
      SELECT b.id, b.booking_no, b.consignee_name, di.pod_photo, di.delivered_at
      FROM delivery_items di JOIN bookings b ON di.booking_id = b.id WHERE di.delivery_id = ?
    `).all(req.params.id);
    res.json(full);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// POD search — find out-for-delivery deliveries by LR no or delivery no
deliveriesRouter.get('/pod/search', (req, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q) return res.json([]);
  const list = db.prepare(`
    SELECT d.*, dp.name as delivery_person_name, dp.phone as delivery_person_phone, dp.vehicle_number as delivery_person_vehicle
    FROM deliveries d
    LEFT JOIN delivery_persons dp ON d.delivery_person_id = dp.id
    WHERE d.status = 'Out for Delivery'
      AND (d.delivery_no LIKE ? OR d.id IN (
        SELECT di.delivery_id FROM delivery_items di
        JOIN bookings b ON di.booking_id = b.id
        WHERE b.booking_no LIKE ?
      ))
    ORDER BY d.created_at DESC
  `).all(`%${q}%`, `%${q}%`) as any[];

  const result = list.map((d) => {
    d.bookings = db.prepare(`
      SELECT b.id, b.booking_no, b.consignee_name, b.consignee_address, b.consignee_contact,
             b.num_bags, b.from_location, b.to_location, b.lr_date,
             di.pod_photo, di.delivered_at
      FROM delivery_items di
      JOIN bookings b ON di.booking_id = b.id
      WHERE di.delivery_id = ?
    `).all(d.id);
    return d;
  });
  res.json(result);
});

deliveriesRouter.delete('/:id', (req, res) => {
  try {
    const items = db.prepare('SELECT booking_id FROM delivery_items WHERE delivery_id = ?').all(req.params.id) as any[];
    for (const item of items) {
      db.prepare('UPDATE bookings SET out_for_delivery = 0 WHERE id = ?').run(item.booking_id);
    }
    db.prepare('DELETE FROM delivery_items WHERE delivery_id = ?').run(req.params.id);
    db.prepare('DELETE FROM deliveries WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Get all delivered LRs with POD data
deliveriesRouter.get('/delivered/lrs', (_req, res) => {
  const rows = db.prepare(`
    SELECT b.id, b.booking_no, b.lr_date, b.consignor_name, b.consignor_contact,
           b.consignee_name, b.consignee_address, b.consignee_contact,
           b.from_location, b.to_location, b.num_bags, b.actual_weight, b.charged_weight,
           b.type_of_packing, b.said_to_contain, b.private_marka,
           b.freight, b.total_charges, b.grand_total,
           b.eway_bill_no,
           di.pod_photo, di.delivered_at,
           d.delivery_no, d.delivery_date,
           dp.name as delivery_person_name, dp.phone as delivery_person_phone
    FROM bookings b
    JOIN delivery_items di ON di.booking_id = b.id
    JOIN deliveries d ON d.id = di.delivery_id
    LEFT JOIN delivery_persons dp ON d.delivery_person_id = dp.id
    WHERE b.delivered = 1
    ORDER BY di.delivered_at DESC
  `).all();
  res.json(rows);
});
