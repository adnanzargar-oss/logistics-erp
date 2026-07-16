import { Router } from 'express';
import db from '../database.js';

const router = Router();

interface EntityDef {
  table: string;
  label: string;
  columns: string[];
  exportCols: string[];
  dateField?: string;
  statusField?: string;
  sample: Record<string, any>;
}

const ENTITIES: Record<string, EntityDef> = {
  bookings: {
    table: 'bookings',
    label: 'Bookings (LRR)',
    columns: [
      'id', 'booking_no', 'customer_id', 'vehicle_id', 'driver_id',
      'consignor_name', 'consignor_address', 'consignor_gstin', 'consignor_contact',
      'consignee_name', 'consignee_address', 'consignee_gstin', 'consignee_contact',
      'consignee_delivery_address', 'num_bags', 'type_of_packing', 'said_to_contain',
      'actual_weight', 'charged_weight', 'private_marka', 'material_invoice_no',
      'material_invoice_date', 'material_invoice_amt', 'freight', 'eway_bill_charges',
      'previous_freight', 'door_delivery', 'consignment_charges', 'other_charges',
      'total_charges', 'discount', 'grand_total', 'eway_bill_no', 'eway_expiry_date',
      'lr_date', 'from_location', 'to_location', 'paid', 'paid_by',
      'loaded', 'delivered', 'received', 'out_for_delivery', 'status', 'notes',
      'pickup_location', 'delivery_location', 'pickup_date', 'delivery_date', 'created_at',
    ],
    exportCols: [
      'booking_no', 'lr_date', 'from_location', 'to_location',
      'consignor_name', 'consignor_contact', 'consignee_name', 'consignee_contact',
      'consignee_delivery_address', 'num_bags', 'type_of_packing', 'said_to_contain',
      'actual_weight', 'charged_weight', 'freight', 'eway_bill_charges',
      'door_delivery', 'consignment_charges', 'other_charges', 'total_charges',
      'discount', 'grand_total', 'eway_bill_no', 'eway_expiry_date',
      'material_invoice_no', 'private_marka', 'paid', 'status',
    ],
    dateField: 'lr_date',
    statusField: 'status',
    sample: {
      booking_no: 'PT-1-2026', lr_date: '2026-07-15', from_location: 'Srinagar', to_location: 'Delhi',
      consignor_name: 'ABC Traders', consignor_contact: '9419428505',
      consignee_name: 'XYZ Distributors', consignee_contact: '9876543210',
      consignee_delivery_address: '123, Main Street, Delhi', num_bags: 50,
      type_of_packing: 'Gunny Bags', actual_weight: 2500, charged_weight: 2600,
      freight: 15000, grand_total: 17500, eway_bill_no: 'EWB123456',
      status: 'Booked',
    },
  },
  customers: {
    table: 'customers',
    label: 'Customers',
    columns: [
      'id', 'customer_no', 'name', 'company', 'phone', 'email', 'address',
      'gstin', 'customer_type', 'status', 'account_manager', 'tags', 'created_at',
    ],
    exportCols: [
      'customer_no', 'name', 'company', 'phone', 'email', 'address',
      'gstin', 'customer_type', 'status', 'account_manager', 'tags',
    ],
    statusField: 'status',
    sample: {
      customer_no: 'CUST-001-2026', name: 'ABC Traders', company: 'ABC Traders Pvt Ltd',
      phone: '9419428505', email: 'abc@example.com', address: 'Tengpora, Srinagar',
      gstin: '01ABCDE1234F1Z5', customer_type: 'Company', status: 'Active',
    },
  },
  vehicles: {
    table: 'vehicles',
    label: 'Vehicles',
    columns: [
      'id', 'reg_number', 'type', 'model', 'year', 'chassis_number',
      'fuel_type', 'capacity_kg', 'status', 'insurance_expiry', 'permit_expiry',
      'fitness_expiry', 'created_at',
    ],
    exportCols: [
      'reg_number', 'type', 'model', 'year', 'chassis_number',
      'fuel_type', 'capacity_kg', 'status', 'insurance_expiry', 'permit_expiry', 'fitness_expiry',
    ],
    statusField: 'status',
    sample: {
      reg_number: 'JK01AB1234', type: 'Truck', model: 'Tata 407', year: 2023,
      chassis_number: 'MAT1234567890', fuel_type: 'Diesel', capacity_kg: 5000,
      status: 'Active', insurance_expiry: '2027-06-30', permit_expiry: '2027-12-31',
    },
  },
  drivers: {
    table: 'drivers',
    label: 'Drivers',
    columns: [
      'id', 'name', 'phone', 'email', 'license_number', 'license_expiry',
      'emergency_contact', 'emergency_phone', 'address', 'status', 'vehicle_id', 'created_at',
    ],
    exportCols: [
      'name', 'phone', 'email', 'license_number', 'license_expiry',
      'emergency_contact', 'emergency_phone', 'address', 'status',
    ],
    statusField: 'status',
    sample: {
      name: 'Rashid Ahmad', phone: '9419428505', email: 'rashid@example.com',
      license_number: 'JK0120241234567', license_expiry: '2029-01-15',
      emergency_contact: 'Firdous Ahmad', emergency_phone: '9906661400',
      address: 'Tengpora, Srinagar', status: 'Active',
    },
  },
  warehouses: {
    table: 'warehouses',
    label: 'Warehouses',
    columns: [
      'id', 'code', 'name', 'address', 'city', 'contact_person',
      'phone', 'email', 'status', 'created_at',
    ],
    exportCols: [
      'code', 'name', 'address', 'city', 'contact_person', 'phone', 'email', 'status',
    ],
    statusField: 'status',
    sample: {
      code: 'WH-SGR-01', name: 'Srinagar Hub', address: 'Tengpora Bypass',
      city: 'Srinagar', contact_person: 'Mudasir Ahmad', phone: '9419428505',
      email: 'warehouse@planettransport.com', status: 'Active',
    },
  },
  fuel_entries: {
    table: 'fuel_entries',
    label: 'Fuel Entries',
    columns: [
      'id', 'vehicle_id', 'fuel_date', 'quantity_ltr', 'cost_per_ltr',
      'total_cost', 'odometer_km', 'station_name', 'payment_type',
      'paid_by', 'notes', 'created_at',
    ],
    exportCols: [
      'fuel_date', 'vehicle_id', 'quantity_ltr', 'cost_per_ltr', 'total_cost',
      'odometer_km', 'station_name', 'payment_type', 'paid_by', 'notes',
    ],
    dateField: 'fuel_date',
    sample: {
      fuel_date: '2026-07-15', quantity_ltr: 50, cost_per_ltr: 94.56,
      total_cost: 4728, odometer_km: 12500, station_name: 'IOC Tengpora',
      payment_type: 'Cash', paid_by: 'Company',
    },
  },
  maintenance_records: {
    table: 'maintenance_records',
    label: 'Maintenance Records',
    columns: [
      'id', 'vehicle_id', 'service_date', 'service_type', 'description',
      'odometer_km', 'labor_cost', 'parts_cost', 'tax_amount', 'total_cost',
      'provider_name', 'next_service_date', 'next_service_km', 'status', 'created_at',
    ],
    exportCols: [
      'service_date', 'vehicle_id', 'service_type', 'description', 'odometer_km',
      'labor_cost', 'parts_cost', 'total_cost', 'provider_name',
      'next_service_date', 'next_service_km', 'status',
    ],
    dateField: 'service_date',
    statusField: 'status',
    sample: {
      service_date: '2026-07-15', service_type: 'Oil Change',
      description: 'Engine oil and filter replacement', odometer_km: 15000,
      labor_cost: 500, parts_cost: 3500, total_cost: 4000,
      provider_name: 'Tata Authorized Service', status: 'Completed',
    },
  },
  invoices: {
    table: 'invoices',
    label: 'Invoices',
    columns: [
      'id', 'invoice_no', 'customer_id', 'booking_id', 'invoice_type',
      'invoice_date', 'due_date', 'subtotal', 'tax_percent', 'tax_amount',
      'total_amount', 'paid_amount', 'status', 'paid_by', 'notes', 'created_at',
    ],
    exportCols: [
      'invoice_no', 'invoice_date', 'due_date', 'customer_id', 'booking_id',
      'subtotal', 'tax_percent', 'tax_amount', 'total_amount', 'paid_amount',
      'status', 'paid_by', 'notes',
    ],
    dateField: 'invoice_date',
    statusField: 'status',
    sample: {
      invoice_no: 'INV-PT-1-2026', invoice_date: '2026-07-15', due_date: '2026-08-14',
      subtotal: 17500, tax_percent: 0, tax_amount: 0, total_amount: 17500,
      paid_amount: 0, status: 'Unpaid',
    },
  },
  payments: {
    table: 'payments',
    label: 'Payments',
    columns: [
      'id', 'payment_no', 'payment_type', 'party_type', 'party_id',
      'party_name', 'invoice_id', 'amount', 'payment_date', 'payment_mode',
      'reference_no', 'notes', 'created_at',
    ],
    exportCols: [
      'payment_no', 'payment_date', 'payment_type', 'party_type', 'party_name',
      'invoice_id', 'amount', 'payment_mode', 'reference_no', 'notes',
    ],
    dateField: 'payment_date',
    sample: {
      payment_no: 'PAY-001', payment_date: '2026-07-15', payment_type: 'Receipt',
      party_type: 'Customer', party_name: 'ABC Traders', amount: 17500,
      payment_mode: 'Bank Transfer', reference_no: 'TRF123456',
    },
  },
  expenses: {
    table: 'expenses',
    label: 'Expenses',
    columns: [
      'id', 'expense_category', 'expense_type', 'vehicle_id', 'warehouse_id',
      'expense_date', 'voucher_no', 'posting_date', 'status', 'branch',
      'department', 'cost_center', 'project', 'vendor_name', 'vendor_code',
      'vendor_type', 'contact_person', 'vendor_email', 'vendor_address',
      'trn_vat_number', 'expense_head', 'quantity', 'unit', 'unit_cost',
      'tax_percentage', 'tax_amount', 'amount', 'total_amount', 'payment_status',
      'payment_mode', 'bank_account', 'cheque_number', 'payment_date',
      'reference_no', 'currency', 'exchange_rate', 'description', 'notes',
      'created_at',
    ],
    exportCols: [
      'voucher_no', 'expense_date', 'posting_date', 'expense_category', 'expense_type',
      'vendor_name', 'vendor_code', 'amount', 'tax_amount', 'total_amount',
      'payment_status', 'payment_mode', 'status', 'description', 'notes',
    ],
    dateField: 'expense_date',
    statusField: 'status',
    sample: {
      expense_category: 'Fuel', expense_date: '2026-07-15',
      vendor_name: 'IOC Petrol Pump', amount: 5000, total_amount: 5000,
      payment_status: 'Paid', payment_mode: 'Cash', status: 'Posted',
      description: 'Diesel for JK01AB1234',
    },
  },
  delivery_persons: {
    table: 'delivery_persons',
    label: 'Delivery Persons',
    columns: [
      'id', 'name', 'phone', 'vehicle_number', 'status', 'created_at',
    ],
    exportCols: [
      'name', 'phone', 'vehicle_number', 'status',
    ],
    statusField: 'status',
    sample: {
      name: 'Firdous Ahmad', phone: '9906661400', vehicle_number: 'JK02CD5678',
      status: 'Active',
    },
  },
};

function toCSV(rows: Record<string, any>[], cols: string[]): string {
  const header = cols.join(',');
  const body = rows.map((row) =>
    cols.map((c) => {
      const v = row[c];
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  ).join('\n');
  return header + '\n' + body;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals: string[] = [];
    let current = '';
    let inQuote = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { vals.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    vals.push(current.trim());
    const row: Record<string, string> = {};
    header.forEach((h, idx) => { row[h] = vals[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

router.get('/entities', (_req, res) => {
  const list = Object.entries(ENTITIES).map(([key, def]) => ({
    id: key,
    label: def.label,
    columns: def.exportCols,
    dateField: def.dateField || null,
    statusField: def.statusField || null,
  }));
  res.json(list);
});

router.get('/export/:entity', (req, res) => {
  const def = ENTITIES[req.params.entity];
  if (!def) return res.status(404).json({ error: 'Unknown entity' });

  const conditions: string[] = [];
  const params: any[] = [];

  if (def.dateField && req.query.date_from) {
    conditions.push(`${def.dateField} >= ?`);
    params.push(req.query.date_from as string);
  }
  if (def.dateField && req.query.date_to) {
    conditions.push(`${def.dateField} <= ?`);
    params.push(req.query.date_to as string);
  }
  if (def.statusField && req.query.status) {
    conditions.push(`${def.statusField} = ?`);
    params.push(req.query.status as string);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT ${def.exportCols.join(', ')} FROM ${def.table} ${where} ORDER BY id DESC`).all(...params);
  const csv = toCSV(rows as Record<string, any>[], def.exportCols);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.entity}-export.csv"`);
  res.send(csv);
});

router.get('/sample/:entity', (req, res) => {
  const def = ENTITIES[req.params.entity];
  if (!def) return res.status(404).json({ error: 'Unknown entity' });

  const data = def.exportCols.map((c) => def.sample[c] !== undefined ? String(def.sample[c]) : '');
  const header = def.exportCols.join(',');
  const row = data.join(',');
  const csv = header + '\n' + row;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.entity}-sample.csv"`);
  res.send(csv);
});

router.post('/import/:entity', (req, res) => {
  const def = ENTITIES[req.params.entity];
  if (!def) return res.status(404).json({ error: 'Unknown entity' });

  const { rows, columnMapping } = req.body as { rows: Record<string, string>[]; columnMapping?: Record<string, string> };

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'No rows provided' });
  }

  const importCols = def.columns.filter((c) => c !== 'id' && c !== 'created_at');
  const idCol = def.table === 'bookings' ? 'booking_no' : def.table === 'invoices' ? 'invoice_no' : null;

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  const insertCols: string[] = [];
  const placeholders: string[] = [];

  for (const col of importCols) {
    if (idCol === col && def.table !== 'bookings') continue;
    insertCols.push(col);
    placeholders.push('?');
  }

  const stmt = db.prepare(`INSERT OR IGNORE INTO ${def.table} (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`);

  const tx = db.transaction(() => {
    for (const row of rows) {
      try {
        const vals = insertCols.map((col) => {
          let key = col;
          if (columnMapping && columnMapping[col]) key = columnMapping[col];
          const v = row[key];
          if (v === undefined || v === null || v === '') return null;
          const num = Number(v);
          if (!isNaN(num) && v.trim() !== '') return num;
          return v;
        });

        if (idCol) {
          const existing = db.prepare(`SELECT id FROM ${def.table} WHERE ${idCol} = ?`).get(vals[insertCols.indexOf(idCol)]);
          if (existing) {
            skipped++;
            continue;
          }
        }

        stmt.run(...vals);
        imported++;
      } catch (e: any) {
        errors.push(e.message);
      }
    }
  });

  tx();

  res.json({ imported, skipped, errors: errors.length > 0 ? errors.slice(0, 10) : [] });
});

export default router;
