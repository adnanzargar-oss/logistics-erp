import { Router } from 'express';
import db from '../database.js';
import { nextInvoiceNo } from '../database.js';

export const invoicesRouter = Router();

invoicesRouter.get('/', (req, res) => {
  const { status, booking_id } = req.query;
  let sql = `
    SELECT i.*, c.name as customer_name, c.company as customer_company,
           c.address as customer_address, c.phone as customer_phone, c.gstin as customer_gstin,
           b.booking_no as booking_no, b.consignor_name, b.consignee_name,
           b.grand_total as booking_total
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN bookings b ON i.booking_id = b.id
  `;
  const params: any[] = [];
  const wheres: string[] = [];
  if (status) { wheres.push('i.status = ?'); params.push(status); }
  if (booking_id) { wheres.push('i.booking_id = ?'); params.push(booking_id); }
  if (wheres.length) sql += ' WHERE ' + wheres.join(' AND ');
  sql += ' ORDER BY i.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

invoicesRouter.get('/:id', (req, res) => {
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.company as customer_company,
           c.address as customer_address, c.phone as customer_phone, c.gstin as customer_gstin
    FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id WHERE i.id = ?
  `).get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(invoice);
});

invoicesRouter.post('/', (req, res) => {
  const { customer_id, booking_id, invoice_date, due_date, subtotal, tax_percent, tax_amount, total_amount, notes } = req.body;
  const invNo = nextInvoiceNo();
  try {
    const result = db.prepare(`
      INSERT INTO invoices (invoice_no, customer_id, booking_id, invoice_date, due_date, subtotal, tax_percent, tax_amount, total_amount, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(invNo, customer_id, booking_id, invoice_date, due_date, subtotal ?? total_amount, tax_percent ?? 0, tax_amount ?? 0, total_amount, notes);
    res.status(201).json({ id: result.lastInsertRowid, invoice_no: invNo, ...req.body });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

invoicesRouter.put('/:id', (req, res) => {
  const { status, paid_amount } = req.body;
  try {
    if (paid_amount !== undefined) {
      db.prepare('UPDATE invoices SET paid_amount = ?, status = CASE WHEN ? >= total_amount THEN \'Paid\' WHEN ? > 0 THEN \'Partial\' ELSE status END, updated_at=datetime(\'now\') WHERE id=?')
        .run(paid_amount, paid_amount, paid_amount, req.params.id);
    }
    if (status) {
      db.prepare('UPDATE invoices SET status=?, updated_at=datetime(\'now\') WHERE id=?').run(status, req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

invoicesRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
