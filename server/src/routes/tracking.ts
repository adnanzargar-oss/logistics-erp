import { Router } from 'express';
import db from '../database.js';

export const trackingRouter = Router();

trackingRouter.get('/:booking_no', (req, res) => {
  const booking = db.prepare(`
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
    WHERE b.booking_no = ?
  `).get(req.params.booking_no) as any;

  if (!booking) return res.status(404).json({ error: 'LRR not found' });

  const loading = db.prepare(`
    SELECT l.loading_no, l.loading_date, l.status as loading_status
    FROM loadings l
    JOIN loading_items li ON li.loading_id = l.id
    WHERE li.booking_id = ?
  `).get(booking.id) as any;

  const delivery = db.prepare(`
    SELECT d.delivery_no, d.delivery_date, d.status as delivery_status,
           dp.name as delivery_person_name, dp.phone as delivery_person_phone
    FROM deliveries d
    JOIN delivery_items di ON di.delivery_id = d.id
    LEFT JOIN delivery_persons dp ON dp.id = d.delivery_person_id
    WHERE di.booking_id = ?
  `).get(booking.id) as any;

  const receiving = db.prepare(`
    SELECT r.receiving_no, r.receiving_date, r.status as receiving_status,
           ri.bags_received, ri.short_bags, w.name as warehouse_name
    FROM receivings r
    JOIN receiving_items ri ON ri.receiving_id = r.id
    LEFT JOIN warehouses w ON w.id = r.warehouse_id
    WHERE ri.booking_id = ?
  `).get(booking.id) as any;

  const stages = [
    { label: 'Booked', date: booking.created_at, done: true, icon: 'clipboard' },
    { label: 'Loaded', date: booking.loaded ? (loading?.loading_date || null) : null, done: !!booking.loaded, icon: 'package', ref: loading?.loading_no || null },
    { label: 'Received at Hub', date: booking.received ? (receiving?.receiving_date || null) : null, done: !!booking.received, icon: 'inbox', ref: receiving?.receiving_no || null },
    { label: 'Out for Delivery', date: (booking.out_for_delivery || booking.delivered) ? (delivery?.delivery_date || null) : null, done: !!(booking.out_for_delivery || booking.delivered), icon: 'truck', ref: delivery?.delivery_no || null },
    { label: 'Delivered', date: booking.delivered ? (delivery?.delivery_date || null) : null, done: !!booking.delivered, icon: 'check' },
  ];

  res.json({ booking, stages });
});
