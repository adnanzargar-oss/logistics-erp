import { Router } from 'express';
import db from '../database.js';

export const dashboardRouter = Router();

dashboardRouter.get('/activity', (_req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT 'booking' as type, id, booking_no as ref, consignor_name || ' → ' || consignee_name as description, status, created_at, lr_date as event_date
      FROM bookings ORDER BY id DESC LIMIT 10
    `).all();
    const loadings = db.prepare(`
      SELECT 'loading' as type, l.id as id, l.loading_no as ref, v.reg_number || ' loaded' as description, l.status, l.created_at, l.loading_date as event_date
      FROM loadings l LEFT JOIN vehicles v ON v.id = l.vehicle_id ORDER BY l.id DESC LIMIT 10
    `).all();
    const receivings = db.prepare(`
      SELECT 'receiving' as type, r.id, r.receiving_no as ref, w.name || ' received' as description, r.status, r.created_at, r.receiving_date as event_date
      FROM receivings r LEFT JOIN warehouses w ON w.id = r.warehouse_id ORDER BY r.id DESC LIMIT 10
    `).all();
    const deliveries = db.prepare(`
      SELECT 'delivery' as type, d.id, d.delivery_no as ref, dp.name || ' delivering' as description, d.status, d.created_at, d.delivery_date as event_date
      FROM deliveries d LEFT JOIN delivery_persons dp ON dp.id = d.delivery_person_id ORDER BY d.id DESC LIMIT 10
    `).all();
    const invoices = db.prepare(`
      SELECT 'invoice' as type, id, invoice_no as ref, 'Invoice created' as description, status, created_at, invoice_date as event_date
      FROM invoices ORDER BY id DESC LIMIT 10
    `).all();
    const expenses = db.prepare(`
      SELECT 'expense' as type, id, voucher_no as ref, expense_category || ' expense' as description, status, created_at, expense_date as event_date
      FROM expenses ORDER BY id DESC LIMIT 10
    `).all();
    const payments = db.prepare(`
      SELECT 'payment' as type, id, payment_no as ref, party_name || ' payment' as description, '' as status, created_at, payment_date as event_date
      FROM payments ORDER BY id DESC LIMIT 10
    `).all();

    const all = [...bookings, ...loadings, ...receivings, ...deliveries, ...invoices, ...expenses, ...payments]
      .sort((a: any, b: any) => {
        const da = a.event_date || a.created_at;
        const db_ = b.event_date || b.created_at;
        return da > db_ ? -1 : da < db_ ? 1 : 0;
      })
      .slice(0, 30);

    res.json(all);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

dashboardRouter.get('/', (_req, res) => {
  try {
    const [bookingStats] = db.prepare(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Booked' THEN 1 ELSE 0 END) as booked
      FROM bookings
    `).all() as any[];

    const [vehicleStats] = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
      FROM vehicles
    `).all() as any[];

    const [driverStats] = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
      FROM drivers
    `).all() as any[];

    const [invoiceStats] = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as paid_amount,
        COALESCE(SUM(total_amount - paid_amount), 0) as outstanding
      FROM invoices
    `).all() as any[];

    const [paymentStats] = db.prepare(`
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(amount), 0) as total_amount
      FROM payments
    `).all() as any[];

    const [fuelStats] = db.prepare(`
      SELECT 
        COUNT(*) as total_entries,
        COALESCE(SUM(quantity_ltr), 0) as total_liters,
        COALESCE(SUM(total_cost), 0) as total_cost
      FROM fuel_entries
      WHERE fuel_date >= date('now', '-30 days')
    `).all() as any[];

    const monthlyBookings = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
      FROM bookings WHERE created_at >= date('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all();

    const monthlyLoadings = db.prepare(`
      SELECT strftime('%Y-%m', loading_date) as month, COUNT(*) as count
      FROM loadings WHERE loading_date >= date('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all();

    const monthlyReceivings = db.prepare(`
      SELECT strftime('%Y-%m', receiving_date) as month, COUNT(*) as count
      FROM receivings WHERE receiving_date >= date('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all();

    const monthlyDeliveries = db.prepare(`
      SELECT strftime('%Y-%m', delivery_date) as month, COUNT(*) as count
      FROM deliveries WHERE delivery_date >= date('now', '-6 months')
      GROUP BY month ORDER BY month
    `).all();

    const recentBookings = db.prepare(`
      SELECT id, booking_no, consignor_name, consignee_name, grand_total, status, created_at
      FROM bookings ORDER BY id DESC LIMIT 8
    `).all();

    const loadingStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Loaded' THEN 1 ELSE 0 END) as in_transit,
        SUM(CASE WHEN status = 'Received' THEN 1 ELSE 0 END) as received
      FROM loadings
    `).all() as any[];

    const customerCount = db.prepare(`SELECT COUNT(*) as total FROM customers`).all() as any[];

    const today = new Date().toISOString().split('T')[0];

    const todayLoadings = db.prepare(`
      SELECT COUNT(*) as count FROM loadings WHERE loading_date = ?
    `).get(today) as any;

    const todayReceivings = db.prepare(`
      SELECT COUNT(*) as count FROM receivings WHERE receiving_date = ?
    `).get(today) as any;

    const todayDeliveries = db.prepare(`
      SELECT COUNT(*) as count FROM deliveries WHERE delivery_date = ?
    `).get(today) as any;

    res.json({
      bookings: bookingStats,
      vehicles: vehicleStats,
      drivers: driverStats,
      invoices: invoiceStats,
      payments: paymentStats,
      fuel: fuelStats,
      monthlyBookings,
      monthlyLoadings,
      monthlyReceivings,
      monthlyDeliveries,
      recentBookings,
      loadingStats: loadingStats[0],
      customerCount: customerCount[0].total,
      todayOps: {
        loadings: todayLoadings?.count || 0,
        receivings: todayReceivings?.count || 0,
        deliveries: todayDeliveries?.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
