import express from 'express';
import cors from 'cors';
import db from './database.js';
import {
  bookingsRouter,
  vehiclesRouter,
  driversRouter,
  fleetRouter,
  customersRouter,
  fuelRouter,
  maintenanceRouter,
  invoicesRouter,
  paymentsRouter,
  expensesRouter,
  warehousesRouter,
  loadingsRouter,
  deliveriesRouter,
  dashboardRouter,
  receivingsRouter,
  deliveryPersonsRouter,
  authRouter,
  trackingRouter,
} from './routes/index.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/bookings', bookingsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/customers', customersRouter);
app.use('/api/fleet', fleetRouter);
app.use('/api/fuel', fuelRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/loadings', loadingsRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/receivings', receivingsRouter);
app.use('/api/delivery-persons', deliveryPersonsRouter);
app.use('/api/auth', authRouter);
app.use('/api/track', trackingRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/search', (req, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q) return res.json([]);
  const like = `%${q}%`;
  const bookings = db.prepare(`
    SELECT id, booking_no AS code, 'LRR' AS type, consignor_name, consignee_name
    FROM bookings WHERE booking_no LIKE ? OR consignor_name LIKE ? OR consignee_name LIKE ?
    LIMIT 10
  `).all(like, like, like);
  const loadings = db.prepare(`
    SELECT l.id, l.loading_no AS code, 'Load' AS type, NULL AS consignor_name, NULL AS consignee_name
    FROM loadings l WHERE l.loading_no LIKE ? LIMIT 10
  `).all(like);
  const deliveries = db.prepare(`
    SELECT d.id, d.delivery_no AS code, 'Delivery' AS type, NULL AS consignor_name, NULL AS consignee_name
    FROM deliveries d WHERE d.delivery_no LIKE ? LIMIT 10
  `).all(like);
  res.json([...bookings, ...loadings, ...deliveries]);
});

app.listen(PORT, () => {
  console.log(`LogiERP server running on http://localhost:${PORT}`);
});
