import { Router } from 'express';
import db from '../database.js';

export const paymentsRouter = Router();

paymentsRouter.get('/', (req, res) => {
  const { party_type, party_id } = req.query;
  let sql = `SELECT p.* FROM payments p WHERE 1=1`;
  const params: any[] = [];
  if (party_type) { sql += ' AND p.party_type = ?'; params.push(party_type); }
  if (party_id) { sql += ' AND p.party_id = ?'; params.push(party_id); }
  sql += ' ORDER BY p.payment_date DESC';
  res.json(db.prepare(sql).all(...params));
});

paymentsRouter.post('/', (req, res) => {
  const { payment_type, party_type, party_id, party_name, invoice_id, amount, payment_date, payment_mode, reference_no, notes } = req.body;
  const payNo = 'PAY-' + Date.now().toString(36).toUpperCase();
  try {
    const result = db.prepare(`
      INSERT INTO payments (payment_no, payment_type, party_type, party_id, party_name, invoice_id, amount, payment_date, payment_mode, reference_no, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(payNo, payment_type, party_type, party_id, party_name, invoice_id, amount, payment_date, payment_mode ?? 'Cash', reference_no, notes);
    if (invoice_id) {
      const invoice = db.prepare('SELECT paid_amount, total_amount FROM invoices WHERE id = ?').get(invoice_id) as any;
      if (invoice) {
        const newPaid = (invoice.paid_amount ?? 0) + amount;
        const newStatus = newPaid >= invoice.total_amount ? 'Paid' : (newPaid > 0 ? 'Partial' : 'Unpaid');
        db.prepare('UPDATE invoices SET paid_amount = ?, status = ?, updated_at=datetime(\'now\') WHERE id = ?').run(newPaid, newStatus, invoice_id);
      }
    }
    res.status(201).json({ id: result.lastInsertRowid, payment_no: payNo, ...req.body });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

paymentsRouter.delete('/:id', (req, res) => {
  try {
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id) as any;
    if (payment?.invoice_id) {
      const invoice = db.prepare('SELECT paid_amount FROM invoices WHERE id = ?').get(payment.invoice_id) as any;
      if (invoice) {
        const newPaid = Math.max(0, (invoice.paid_amount ?? 0) - payment.amount);
        const newStatus = newPaid >= invoice.total_amount ? 'Paid' : (newPaid > 0 ? 'Partial' : 'Unpaid');
        db.prepare('UPDATE invoices SET paid_amount = ?, status = ?, updated_at=datetime(\'now\') WHERE id = ?').run(newPaid, newStatus, payment.invoice_id);
      }
    }
    db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
