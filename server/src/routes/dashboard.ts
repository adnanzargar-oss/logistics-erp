import { Router } from 'express';
import db from '../database.js';

export const dashboardRouter = Router();

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
