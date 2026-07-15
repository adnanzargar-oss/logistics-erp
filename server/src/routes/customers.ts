import { Router } from 'express';
import db, { nextCustomerNo } from '../database.js';

export const customersRouter = Router();

customersRouter.get('/', (_req, res) => {
  const customers = db.prepare(`
    SELECT c.*,
      (SELECT COUNT(*) FROM bookings WHERE customer_id = c.id) as total_bookings,
      (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE customer_id = c.id) as total_invoiced,
      (SELECT COALESCE(SUM(ri.bags_received), 0) FROM receivings r
        JOIN receiving_items ri ON ri.receiving_id = r.id
        JOIN bookings b ON b.id = ri.booking_id AND b.customer_id = c.id) as total_nags_received
    FROM customers c ORDER BY c.created_at DESC
  `).all();
  res.json(customers);
});

customersRouter.get('/:id', (req, res) => {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

customersRouter.post('/', (req, res) => {
  const { name, company, phone, email, address, gstin, customer_type, account_manager, tags } = req.body;
  try {
    const customerNo = nextCustomerNo();
    const result = db.prepare(
      'INSERT INTO customers (customer_no, name, company, phone, email, address, gstin, customer_type, status, account_manager, tags) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    ).run(customerNo, name, company, phone, email, address, gstin, customer_type || 'Individual', 'Active', account_manager || null, JSON.stringify(tags || []));
    res.status(201).json({ id: result.lastInsertRowid, customer_no: customerNo, ...req.body, status: 'Active' });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

customersRouter.put('/:id', (req, res) => {
  const { name, company, phone, email, address, gstin, customer_type, status, account_manager, tags } = req.body;
  try {
    db.prepare(
      'UPDATE customers SET name=?, company=?, phone=?, email=?, address=?, gstin=?, customer_type=?, status=?, account_manager=?, tags=? WHERE id=?'
    ).run(name, company, phone, email, address, gstin, customer_type || 'Individual', status || 'Active', account_manager || null, JSON.stringify(tags || []), req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
