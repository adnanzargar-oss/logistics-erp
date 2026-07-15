import { Router } from 'express';
import db from '../database.js';
import { nextInvoiceNo } from '../database.js';

export const bookingsRouter = Router();

const BOOKING_SELECT = `
  SELECT b.*, c.name as customer_name, c.company as customer_company,
         v.reg_number as vehicle_reg, v.type as vehicle_type,
         d.name as driver_name, d.phone as driver_phone,
         pw.name as pickup_warehouse_name, dw.name as delivery_warehouse_name
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  LEFT JOIN vehicles v ON b.vehicle_id = v.id
  LEFT JOIN drivers d ON b.driver_id = d.id
  LEFT JOIN warehouses pw ON b.pickup_warehouse_id = pw.id
  LEFT JOIN warehouses dw ON b.delivery_warehouse_id = dw.id
`;

const BOOKING_COLS = [
  'booking_no', 'customer_id', 'vehicle_id', 'driver_id',
  'pickup_location', 'delivery_location', 'pickup_date', 'delivery_date',
  'pickup_warehouse_id', 'delivery_warehouse_id',
  'consignor_name', 'consignor_address', 'consignor_gstin', 'consignor_contact',
  'consignee_name', 'consignee_address', 'consignee_gstin', 'consignee_contact', 'consignee_delivery_address',
  'num_bags', 'type_of_packing', 'said_to_contain', 'actual_weight', 'charged_weight', 'private_marka',
  'material_invoice_no', 'material_invoice_date', 'material_invoice_amt',
  'freight', 'eway_bill_charges', 'previous_freight', 'door_delivery', 'consignment_charges', 'other_charges',
  'total_charges', 'discount', 'grand_total',
  'eway_bill_no', 'eway_expiry_date',
  'lr_date', 'from_location', 'to_location',
  'material', 'weight_kg', 'distance_km', 'rate_type', 'rate_amount', 'total_amount',
  'status', 'invoice_no', 'notes', 'paid', 'paid_by',
];

const COLS = BOOKING_COLS;
const PLACEHOLDERS = COLS.map(() => '?').join(', ');
const SET_CLAUSE = COLS.map((c) => `${c}=?`).join(', ');

bookingsRouter.get('/', (req, res) => {
  const { status } = req.query;
  let sql = BOOKING_SELECT;
  const params: any[] = [];
  if (status) { sql += ' WHERE b.status = ?'; params.push(status); }
  sql += ' ORDER BY b.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

bookingsRouter.get('/:id', (req, res) => {
  const booking = db.prepare(BOOKING_SELECT + ' WHERE b.id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

function pickup(p: any) {
  return COLS.map((c) => p[c] ?? null);
}

function syncCustomer(name: string, address?: string, gstin?: string, phone?: string) {
  if (!name || name.trim() === '') return;
  const existing = db.prepare('SELECT id FROM customers WHERE name = ?').get(name.trim()) as any;
  if (!existing) {
    db.prepare('INSERT INTO customers (name, address, gstin, phone) VALUES (?,?,?,?)')
      .run(name.trim(), address || null, gstin || null, phone || null);
  }
}

function calcCharges(d: any) {
  const total = (d.freight ?? 0) + (d.eway_bill_charges ?? 0) + (d.previous_freight ?? 0)
    + (d.door_delivery ?? 0) + (d.consignment_charges ?? 0) + (d.other_charges ?? 0);
  return { total_charges: total, grand_total: total - (d.discount ?? 0) };
}

function syncInvoice(bookingId: number, data: any) {
  const paid = data.paid === 1 || data.paid === true || data.paid === '1';
  const paidBy = data.paid_by;
  const existing = db.prepare('SELECT id, invoice_no, status FROM invoices WHERE booking_id = ?').get(bookingId) as any;
  const totalAmount = data.grand_total ?? 0;
  let customerId: number | null = null;
  if (paidBy) {
    const payerName = paidBy === 'consignor' ? data.consignor_name : data.consignee_name;
    if (payerName) {
      const found = db.prepare('SELECT id FROM customers WHERE name = ?').get(payerName.trim()) as any;
      if (found) customerId = found.id;
    }
  }
  if (paidBy && (paid || !existing)) {
    if (existing) {
      db.prepare("UPDATE invoices SET total_amount=?, paid_amount=?, status=?, paid_by=?, customer_id=?, updated_at=datetime('now') WHERE id=?")
        .run(totalAmount, paid ? totalAmount : 0, paid ? 'Paid' : 'Unpaid', paidBy, customerId, existing.id);
    } else {
      const invNo = nextInvoiceNo();
      db.prepare('INSERT INTO invoices (invoice_no, booking_id, customer_id, invoice_date, total_amount, paid_amount, status, paid_by) VALUES (?,?,?,?,?,?,?,?)')
        .run(invNo, bookingId, customerId, data.lr_date || new Date().toISOString().slice(0, 10), totalAmount, paid ? totalAmount : 0, paid ? 'Paid' : 'Unpaid', paidBy);
    }
  } else if (paid && !paidBy) {
    if (existing) {
      db.prepare("UPDATE invoices SET total_amount=?, paid_amount=?, status='Paid', updated_at=datetime('now') WHERE id=?")
        .run(totalAmount, totalAmount, existing.id);
    } else {
      const invNo = nextInvoiceNo();
      db.prepare('INSERT INTO invoices (invoice_no, booking_id, invoice_date, total_amount, paid_amount, status) VALUES (?,?,?,?,?,?)')
        .run(invNo, bookingId, data.lr_date || new Date().toISOString().slice(0, 10), totalAmount, totalAmount, 'Paid');
    }
  } else if (existing && !paidBy) {
    db.prepare("UPDATE invoices SET total_amount=?, paid_amount=0, status='Unpaid', updated_at=datetime('now') WHERE id=?")
      .run(totalAmount, existing.id);
  }
}

bookingsRouter.post('/', (req, res) => {
  const year = new Date().getFullYear();
  const last = db.prepare("SELECT booking_no FROM bookings WHERE booking_no LIKE ? ORDER BY id DESC LIMIT 1").get(`PT-%-${year}`) as any;
  let seq = 1;
  if (last) {
    const m = last.booking_no.match(/PT-(\d+)-/);
    if (m) seq = parseInt(m[1], 10) + 1;
  }
  const bookingNo = `PT-${seq}-${year}`;
  const data = { ...req.body, booking_no: bookingNo, ...calcCharges(req.body) };
  syncCustomer(data.consignor_name, data.consignor_address, data.consignor_gstin, data.consignor_contact);
  syncCustomer(data.consignee_name, data.consignee_address, data.consignee_gstin, data.consignee_contact);
  try {
    const result = db.prepare(
      `INSERT INTO bookings (${COLS.join(', ')}) VALUES (${PLACEHOLDERS})`
    ).run(...pickup(data));
    const bookingId = result.lastInsertRowid as number;
    syncInvoice(bookingId, data);
    res.status(201).json({ id: bookingId, ...data });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

bookingsRouter.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ error: 'Booking not found' });
    const data = { ...existing, ...req.body, ...calcCharges(req.body) };
    syncCustomer(data.consignor_name, data.consignor_address, data.consignor_gstin, data.consignor_contact);
    syncCustomer(data.consignee_name, data.consignee_address, data.consignee_gstin, data.consignee_contact);
    db.prepare(`UPDATE bookings SET ${SET_CLAUSE}, updated_at=datetime('now') WHERE id=?`)
      .run(...pickup(data), req.params.id);
    syncInvoice(Number(req.params.id), data);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

bookingsRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
