import { Router } from 'express';
import db, { nextExpenseVoucherNo } from '../database.js';

export const expensesRouter = Router();

const EXPENSE_COLS = [
  'voucher_no', 'expense_date', 'posting_date',
  'expense_type', 'expense_category', 'status',
  'branch', 'vehicle_id', 'warehouse_id', 'department', 'cost_center', 'project',
  'vendor_name', 'vendor_code', 'vendor_type', 'contact_person', 'phone',
  'vendor_email', 'vendor_address', 'trn_vat_number',
  'expense_head', 'description', 'quantity', 'unit', 'unit_cost',
  'amount', 'tax_percentage', 'tax_amount', 'total_amount',
  'payment_status', 'payment_mode', 'bank_account', 'cheque_number',
  'reference_no', 'payment_date', 'currency', 'exchange_rate', 'notes',
];

expensesRouter.get('/', (req, res) => {
  const { category, vehicle_id } = req.query;
  let sql = `SELECT e.*, v.reg_number as vehicle_reg FROM expenses e LEFT JOIN vehicles v ON e.vehicle_id = v.id WHERE 1=1`;
  const params: any[] = [];
  if (category) { sql += ' AND e.expense_category = ?'; params.push(category); }
  if (vehicle_id) { sql += ' AND e.vehicle_id = ?'; params.push(vehicle_id); }
  sql += ' ORDER BY e.id DESC';
  res.json(db.prepare(sql).all(...params));
});

expensesRouter.get('/categories', (_req, res) => {
  const categories = db.prepare(`
    SELECT expense_category, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
    FROM expenses GROUP BY expense_category ORDER BY total DESC
  `).all();
  res.json(categories);
});

expensesRouter.get('/next-no', (_req, res) => {
  res.json({ voucher_no: nextExpenseVoucherNo() });
});

expensesRouter.post('/', (req, res) => {
  try {
    const data = req.body;
    if (!data.voucher_no) data.voucher_no = nextExpenseVoucherNo();
    const vals = EXPENSE_COLS.map((c) => data[c] ?? null);
    const placeholders = EXPENSE_COLS.map(() => '?').join(', ');
    const result = db.prepare(
      `INSERT INTO expenses (${EXPENSE_COLS.join(', ')}) VALUES (${placeholders})`
    ).run(...vals);
    const expense = db.prepare('SELECT e.*, v.reg_number as vehicle_reg FROM expenses e LEFT JOIN vehicles v ON e.vehicle_id = v.id WHERE e.id = ?').get(result.lastInsertRowid);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

expensesRouter.put('/:id', (req, res) => {
  try {
    const data = req.body;
    const sets = EXPENSE_COLS.map((c) => `${c} = ?`).join(', ');
    const vals = EXPENSE_COLS.map((c) => data[c] ?? null);
    vals.push(req.params.id);
    db.prepare(`UPDATE expenses SET ${sets} WHERE id = ?`).run(...vals);
    const expense = db.prepare('SELECT e.*, v.reg_number as vehicle_reg FROM expenses e LEFT JOIN vehicles v ON e.vehicle_id = v.id WHERE e.id = ?').get(req.params.id);
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

expensesRouter.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
