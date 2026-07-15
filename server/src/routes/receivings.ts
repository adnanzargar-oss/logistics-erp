import { Router } from 'express';
import db from '../database.js';

export const receivingsRouter = Router();

// List all receivings
receivingsRouter.get('/', (_req, res) => {
  const list = db.prepare(`
    SELECT r.*, v.reg_number as vehicle_reg, w.name as warehouse_name,
           (SELECT COUNT(*) FROM receiving_items WHERE receiving_id = r.id) as item_count
    FROM receivings r
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    LEFT JOIN warehouses w ON r.warehouse_id = w.id
    ORDER BY r.created_at DESC
  `).all() as any[];

  const result = list.map((r) => {
    const items = db.prepare(`
      SELECT ri.id, ri.bags_received, ri.short_bags, ri.notes,
             b.id as booking_id, b.booking_no, b.consignor_name, b.consignee_name,
             b.from_location, b.to_location, b.num_bags, b.actual_weight, b.charged_weight,
             b.eway_bill_no, b.freight, b.grand_total
      FROM receiving_items ri
      JOIN bookings b ON ri.booking_id = b.id
      WHERE ri.receiving_id = ?
    `).all(r.id);
    return { ...r, bookings: items };
  });

  res.json(result);
});

// Get loaded LRs for a vehicle (that haven't been received yet)
receivingsRouter.get('/loads', (req, res) => {
  const { vehicle_id } = req.query;
  if (!vehicle_id) return res.status(400).json({ error: 'vehicle_id is required' });

  const loads = db.prepare(`
    SELECT DISTINCT li.id, b.id as booking_id, b.booking_no, b.consignor_name, b.consignee_name,
           b.from_location, b.to_location, b.num_bags, b.actual_weight, b.charged_weight,
           b.eway_bill_no, b.freight, b.grand_total, b.lr_date,
           v.reg_number as vehicle_reg, d.name as driver_name, d.phone as driver_phone, d.license_number
    FROM loading_items li
    JOIN bookings b ON li.booking_id = b.id
    JOIN loadings l ON li.loading_id = l.id
    LEFT JOIN vehicles v ON l.vehicle_id = v.id
    LEFT JOIN drivers d ON l.driver_id = d.id
    WHERE l.vehicle_id = ? AND (b.received IS NULL OR b.received = 0)
    ORDER BY b.booking_no
  `).all(vehicle_id) as any[];

  // Group by vehicle/driver info
  const grouped = loads.reduce((acc: any, item: any) => {
    const key = `${item.vehicle_reg}|${item.driver_name}|${item.driver_phone}|${item.license_number}`;
    if (!acc[key]) {
      acc[key] = {
        vehicle_reg: item.vehicle_reg,
        driver_name: item.driver_name,
        driver_phone: item.driver_phone,
        license_number: item.license_number,
        bookings: [],
      };
    }
    acc[key].bookings.push(item);
    return acc;
  }, {});

  res.json(Object.values(grouped));
});

// Get single receiving detail
receivingsRouter.get('/:id', (req, res) => {
  const receiving = db.prepare(`
    SELECT r.*, v.reg_number as vehicle_reg, w.name as warehouse_name
    FROM receivings r
    LEFT JOIN vehicles v ON r.vehicle_id = v.id
    LEFT JOIN warehouses w ON r.warehouse_id = w.id
    WHERE r.id = ?
  `).get(req.params.id) as any;

  if (!receiving) return res.status(404).json({ error: 'Receiving not found' });

  receiving.bookings = db.prepare(`
    SELECT ri.id, ri.bags_received, ri.short_bags, ri.notes,
           b.id as booking_id, b.booking_no, b.consignor_name, b.consignor_address,
           b.consignee_name, b.consignee_address, b.consignee_delivery_address,
           b.from_location, b.to_location, b.lr_date,
           b.num_bags, b.type_of_packing, b.said_to_contain, b.actual_weight, b.charged_weight, b.private_marka,
           b.material_invoice_no, b.material_invoice_date, b.material_invoice_amt,
           b.freight, b.eway_bill_charges, b.door_delivery, b.consignment_charges, b.other_charges,
           b.total_charges, b.discount, b.grand_total,
           b.eway_bill_no, b.eway_expiry_date
    FROM receiving_items ri
    JOIN bookings b ON ri.booking_id = b.id
    WHERE ri.receiving_id = ?
  `).all(req.params.id);

  res.json(receiving);
});

// Create a new receiving
receivingsRouter.post('/', (req, res) => {
  const { vehicle_id, warehouse_id, receiving_date, bookings: bookingItems, driver_name, driver_phone, license_number, notes } = req.body;
  const receivingNo = 'RCV-' + Date.now().toString(36).toUpperCase();

  try {
    const result = db.prepare(`
      INSERT INTO receivings (receiving_no, vehicle_id, warehouse_id, receiving_date, driver_name, driver_phone, license_number, notes)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(receivingNo, vehicle_id || null, warehouse_id || null, receiving_date, driver_name || null, driver_phone || null, license_number || null, notes || null);

    const receivingId = result.lastInsertRowid;
    const insertItem = db.prepare(`
      INSERT INTO receiving_items (receiving_id, booking_id, bags_received, short_bags, notes)
      VALUES (?,?,?,?,?)
    `);

    if (Array.isArray(bookingItems)) {
      for (const item of bookingItems) {
        const bagsReceived = item.bags_received ?? 0;
        const shortBags = (item.num_bags ?? 0) - bagsReceived;
        insertItem.run(receivingId, item.booking_id, bagsReceived, shortBags, item.notes || null);
        db.prepare('UPDATE bookings SET received = 1 WHERE id = ?').run(item.booking_id);
      }
    }

    res.status(201).json({ id: receivingId, receiving_no: receivingNo });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Delete receiving
receivingsRouter.delete('/:id', (req, res) => {
  try {
    const items = db.prepare('SELECT booking_id FROM receiving_items WHERE receiving_id = ?').all(req.params.id) as any[];
    for (const item of items) {
      db.prepare('UPDATE bookings SET received = 0 WHERE id = ?').run(item.booking_id);
    }
    db.prepare('DELETE FROM receiving_items WHERE receiving_id = ?').run(req.params.id);
    db.prepare('DELETE FROM receivings WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
