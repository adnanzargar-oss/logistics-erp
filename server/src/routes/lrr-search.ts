import { Router } from 'express';
import db from '../database.js';

export const lrrSearchRouter = Router();

lrrSearchRouter.get('/', (req, res) => {
  try {
    const q = (req.query.q as string || '').trim().toUpperCase();
    if (!q) return res.json([]);

    const like = `%${q}%`;
    const results = db.prepare(`
      SELECT
        b.id,
        b.booking_no,
        b.created_at,
        b.consignor_name,
        b.consignee_name,
        b.from_location,
        b.to_location,
        b.status,
        (SELECT l.loading_no FROM loadings l
         JOIN loading_items li ON li.loading_id = l.id
         WHERE li.booking_id = b.id LIMIT 1) as loading_no,
        (SELECT l.loading_date FROM loadings l
         JOIN loading_items li ON li.loading_id = l.id
         WHERE li.booking_id = b.id LIMIT 1) as loading_date,
        (SELECT r.receiving_no FROM receivings r
         JOIN receiving_items ri ON ri.receiving_id = r.id
         WHERE ri.booking_id = b.id LIMIT 1) as receiving_no,
        (SELECT r.receiving_date FROM receivings r
         JOIN receiving_items ri ON ri.receiving_id = r.id
         WHERE ri.booking_id = b.id LIMIT 1) as receiving_date,
        (SELECT w.name FROM warehouses w
         JOIN receivings r ON r.warehouse_id = w.id
         JOIN receiving_items ri ON ri.receiving_id = r.id
         WHERE ri.booking_id = b.id LIMIT 1) as warehouse_name,
        (SELECT d.delivery_no FROM deliveries d
         JOIN delivery_items di ON di.delivery_id = d.id
         WHERE di.booking_id = b.id LIMIT 1) as delivery_no,
        (SELECT d.delivery_date FROM deliveries d
         JOIN delivery_items di ON di.delivery_id = d.id
         WHERE di.booking_id = b.id LIMIT 1) as delivery_date,
        (SELECT di.pod_photo FROM delivery_items di WHERE di.booking_id = b.id LIMIT 1) as pod_photo
      FROM bookings b
      WHERE b.booking_no LIKE ? OR b.consignor_name LIKE ? OR b.consignee_name LIKE ?
      ORDER BY b.id DESC
      LIMIT 20
    `).all(like, like, like);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
