import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'logistics.db');

import fs from 'fs';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reg_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'Truck',
    model TEXT,
    year INTEGER,
    chassis_number TEXT,
    fuel_type TEXT DEFAULT 'Diesel',
    capacity_kg REAL,
    status TEXT DEFAULT 'Active',
    insurance_expiry TEXT,
    permit_expiry TEXT,
    fitness_expiry TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    license_number TEXT,
    license_expiry TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'Active',
    vehicle_id INTEGER REFERENCES vehicles(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_no TEXT UNIQUE,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    gstin TEXT,
    customer_type TEXT DEFAULT 'Individual',
    status TEXT DEFAULT 'Active',
    account_manager TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS warehouse_cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_no TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
    pickup_location TEXT,
    delivery_location TEXT,
    pickup_warehouse_id INTEGER REFERENCES warehouses(id),
    delivery_warehouse_id INTEGER REFERENCES warehouses(id),
    pickup_date TEXT,
    delivery_date TEXT,
    material TEXT,
    weight_kg REAL,
    distance_km REAL,
    rate_type TEXT DEFAULT 'Fixed',
    rate_amount REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'Booked',
    eway_bill_no TEXT,
    invoice_no TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fuel_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER REFERENCES vehicles(id),
    fuel_date TEXT NOT NULL,
    quantity_ltr REAL NOT NULL,
    cost_per_ltr REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    odometer_km REAL,
    station_name TEXT,
    payment_type TEXT DEFAULT 'Cash',
    paid_by TEXT DEFAULT 'Company',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS maintenance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER REFERENCES vehicles(id),
    service_date TEXT NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
    odometer_km REAL,
    labor_cost REAL DEFAULT 0,
    parts_cost REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    provider_name TEXT,
    next_service_date TEXT,
    next_service_km REAL,
    status TEXT DEFAULT 'Completed',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    booking_id INTEGER REFERENCES bookings(id),
    invoice_type TEXT DEFAULT 'Customer',
    invoice_date TEXT NOT NULL,
    due_date TEXT,
    subtotal REAL DEFAULT 0,
    tax_percent REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'Unpaid',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_no TEXT UNIQUE NOT NULL,
    payment_type TEXT NOT NULL,
    party_type TEXT NOT NULL,
    party_id INTEGER,
    party_name TEXT,
    invoice_id INTEGER REFERENCES invoices(id),
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_mode TEXT DEFAULT 'Cash',
    reference_no TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_category TEXT NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    expense_date TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    payment_mode TEXT DEFAULT 'Cash',
    reference_no TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loadings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loading_no TEXT UNIQUE NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
    loading_date TEXT,
    status TEXT DEFAULT 'Loaded',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loading_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loading_id INTEGER REFERENCES loadings(id),
    booking_id INTEGER REFERENCES bookings(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS delivery_persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    vehicle_number TEXT,
    status TEXT DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_no TEXT UNIQUE NOT NULL,
    delivery_date TEXT,
    delivery_person_id INTEGER REFERENCES delivery_persons(id),
    status TEXT DEFAULT 'Out for Delivery',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS delivery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id INTEGER REFERENCES deliveries(id),
    booking_id INTEGER REFERENCES bookings(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS receivings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiving_no TEXT UNIQUE NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    driver_name TEXT,
    driver_phone TEXT,
    license_number TEXT,
    receiving_date TEXT,
    status TEXT DEFAULT 'Received',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS receiving_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiving_id INTEGER REFERENCES receivings(id),
    booking_id INTEGER REFERENCES bookings(id),
    bags_received REAL NOT NULL DEFAULT 0,
    short_bags REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Migration: add warehouse columns to loadings
try { db.exec("ALTER TABLE loadings ADD COLUMN from_warehouse_id INTEGER REFERENCES warehouses(id)"); } catch {}
try { db.exec("ALTER TABLE loadings ADD COLUMN to_warehouse_id INTEGER REFERENCES warehouses(id)"); } catch {}



// Migration: add loaded/delivered/received status to bookings
try { db.exec("ALTER TABLE bookings ADD COLUMN loaded INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE bookings ADD COLUMN delivered INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE bookings ADD COLUMN received INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE deliveries ADD COLUMN delivery_person_id INTEGER REFERENCES delivery_persons(id)"); } catch {}

// Migration: add paid status to bookings
try { db.exec("ALTER TABLE bookings ADD COLUMN paid INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE bookings ADD COLUMN paid_by TEXT DEFAULT NULL"); } catch {}

// Migration: add paid_by to invoices
try { db.exec("ALTER TABLE invoices ADD COLUMN paid_by TEXT DEFAULT NULL"); } catch {}

// Migration: add out_for_delivery to bookings
try { db.exec("ALTER TABLE bookings ADD COLUMN out_for_delivery INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE delivery_items ADD COLUMN pod_photo TEXT"); } catch {}
try { db.exec("ALTER TABLE delivery_items ADD COLUMN delivered_at TEXT"); } catch {}

// Migration: add code to warehouses
try { db.exec("ALTER TABLE warehouses ADD COLUMN code TEXT"); } catch {}

// Migration: add camera_url to warehouses
try { db.exec("ALTER TABLE warehouses ADD COLUMN camera_url TEXT"); } catch {}

// Migration: add expense detail columns
const expenseMigrations = [
  'voucher_no TEXT',
  'posting_date TEXT',
  "expense_type TEXT DEFAULT 'Office'",
  "status TEXT DEFAULT 'Draft'",
  'branch TEXT',
  'warehouse_id INTEGER',
  'department TEXT',
  'cost_center TEXT',
  'project TEXT',
  'vendor_name TEXT',
  'vendor_code TEXT',
  'vendor_type TEXT',
  'contact_person TEXT',
  'vendor_email TEXT',
  'vendor_address TEXT',
  'trn_vat_number TEXT',
  'expense_head TEXT',
  'quantity REAL DEFAULT 1',
  'unit TEXT',
  'unit_cost REAL DEFAULT 0',
  'tax_percentage REAL DEFAULT 0',
  'tax_amount REAL DEFAULT 0',
  'total_amount REAL DEFAULT 0',
  "payment_status TEXT DEFAULT 'Unpaid'",
  'bank_account TEXT',
  'cheque_number TEXT',
  'payment_date TEXT',
  "currency TEXT DEFAULT 'INR'",
  'exchange_rate REAL DEFAULT 1',
  'notes TEXT',
];
for (const colDef of expenseMigrations) {
  try { db.exec(`ALTER TABLE expenses ADD COLUMN ${colDef}`); } catch (e) {
    // column may already exist
  }
}

// Helper: next expense voucher number
export function nextExpenseVoucherNo(): string {
  const year = new Date().getFullYear();
  const last = db.prepare("SELECT voucher_no FROM expenses WHERE voucher_no LIKE ? ORDER BY id DESC LIMIT 1").get(`EXP-${year}-%`) as any;
  let seq = 1;
  if (last) {
    const m = last.voucher_no.match(/EXP-\d+-(\d+)/);
    if (m) seq = parseInt(m[1], 10) + 1;
  }
  return `EXP-${year}-${String(seq).padStart(6, '0')}`;
}

// Migration: add customer profile columns
try { db.exec("ALTER TABLE customers ADD COLUMN customer_no TEXT UNIQUE"); } catch {}
try { db.exec("ALTER TABLE customers ADD COLUMN customer_type TEXT DEFAULT 'Individual'"); } catch {}
try { db.exec("ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'Active'"); } catch {}
try { db.exec("ALTER TABLE customers ADD COLUMN account_manager TEXT"); } catch {}
try { db.exec("ALTER TABLE customers ADD COLUMN tags TEXT DEFAULT '[]'"); } catch {}

// Migrate: add LRR/consignment note columns to bookings
const migrateColumns = [
  'consignor_name TEXT',
  'consignor_address TEXT',
  'consignor_gstin TEXT',
  'consignor_contact TEXT',
  'consignee_name TEXT',
  'consignee_address TEXT',
  'consignee_gstin TEXT',
  'consignee_contact TEXT',
  'consignee_delivery_address TEXT',
  'num_bags REAL',
  'type_of_packing TEXT',
  'said_to_contain TEXT',
  'actual_weight REAL',
  'charged_weight REAL',
  'private_marka TEXT',
  'material_invoice_no TEXT',
  'material_invoice_date TEXT',
  'material_invoice_amt REAL DEFAULT 0',
  'freight REAL DEFAULT 0',
  'eway_bill_charges REAL DEFAULT 0',
  'previous_freight REAL DEFAULT 0',
  'door_delivery REAL DEFAULT 0',
  'consignment_charges REAL DEFAULT 0',
  'other_charges REAL DEFAULT 0',
  'total_charges REAL DEFAULT 0',
  'discount REAL DEFAULT 0',
  'grand_total REAL DEFAULT 0',
  'eway_expiry_date TEXT',
  'lr_date TEXT',
  'from_location TEXT',
  'to_location TEXT',
];

for (const colDef of migrateColumns) {
  const colName = colDef.split(' ')[0];
  try {
    db.exec(`ALTER TABLE bookings ADD COLUMN ${colDef}`);
  } catch {
    // column already exists
  }
}

export function nextInvoiceNo(): string {
  const year = new Date().getFullYear();
  const last = db.prepare("SELECT invoice_no FROM invoices WHERE invoice_no LIKE ? ORDER BY id DESC LIMIT 1").get(`INV-PT-%-${year}`) as any;
  let seq = 1;
  if (last) {
    const m = last.invoice_no.match(/INV-PT-(\d+)-/);
    if (m) seq = parseInt(m[1], 10) + 1;
  }
  return `INV-PT-${seq}-${year}`;
}

// Users table for auth
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    allowed_modules TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export function nextCustomerNo(): string {
  const year = new Date().getFullYear();
  const last = db.prepare("SELECT customer_no FROM customers WHERE customer_no LIKE ? ORDER BY id DESC LIMIT 1").get(`CUST-%-${year}`) as any;
  let seq = 1;
  if (last) {
    const m = last.customer_no.match(/CUST-(\d+)-/);
    if (m) seq = parseInt(m[1], 10) + 1;
  }
  return `CUST-${String(seq).padStart(3, '0')}-${year}`;
}

// Migration: convert allowed_modules to ModulePermissions format
try {
  const rows = db.prepare('SELECT id, allowed_modules FROM users').all() as any[];
  for (const row of rows) {
    const val = JSON.parse(row.allowed_modules || '{}');
    // Old array format: ["bookings", "deliveries"]
    if (Array.isArray(val)) {
      const obj: Record<string, { tabs: string[]; actions: string[] }> = {};
      for (const mod of val) {
        obj[mod] = { tabs: ['*'], actions: ['create', 'edit', 'delete'] };
      }
      db.prepare('UPDATE users SET allowed_modules = ? WHERE id = ?').run(JSON.stringify(obj), row.id);
    }
    // Old object format: {"bookings": ["today", "history"]}
    else if (typeof val === 'object' && val !== null) {
      const firstKey = Object.keys(val)[0];
      if (firstKey && Array.isArray(val[firstKey])) {
        const obj: Record<string, { tabs: string[]; actions: string[] }> = {};
        for (const [mod, subs] of Object.entries(val)) {
          obj[mod] = { tabs: subs as string[], actions: ['create', 'edit', 'delete'] };
        }
        db.prepare('UPDATE users SET allowed_modules = ? WHERE id = ?').run(JSON.stringify(obj), row.id);
      }
    }
  }
} catch {}

export default db;
