import db from './database.js';

function clear() {
  db.exec('PRAGMA foreign_keys = OFF');
  for (const t of [
    'receiving_items', 'receivings',
    'delivery_items', 'deliveries',
    'loading_items', 'loadings',
    'invoices', 'payments',
    'fuel_entries', 'maintenance_records', 'expenses',
    'bookings', 'customers',
    'drivers', 'vehicles',
    'warehouses', 'users', 'delivery_persons',
    'sqlite_sequence',
  ]) {
    try { db.exec(`DELETE FROM ${t}`); } catch {}
  }
  db.exec('PRAGMA foreign_keys = ON');
}

console.log('Seeding sample data...');

clear();

// ─── Vehicles ───────────────────────────────────────────────────────────────
const vehicles = [
  { reg_number: 'JK01AC-1234', type: 'Truck', model: 'Tata LPT 1618', year: 2022, chassis_number: 'TATA1618M2022001', fuel_type: 'Diesel', capacity_kg: 16000, status: 'Active', insurance_expiry: '2025-12-31', permit_expiry: '2025-06-30', fitness_expiry: '2025-09-15' },
  { reg_number: 'JK01AC-5678', type: 'Truck', model: 'Ashok Leyland 1920', year: 2023, chassis_number: 'AL1920N2023002', fuel_type: 'Diesel', capacity_kg: 19000, status: 'Active', insurance_expiry: '2026-03-15', permit_expiry: '2025-08-20', fitness_expiry: '2026-01-10' },
  { reg_number: 'JK01AC-9012', type: 'Truck', model: 'Eicher Pro 6028', year: 2021, chassis_number: 'EICH6028P2021003', fuel_type: 'Diesel', capacity_kg: 25000, status: 'Active', insurance_expiry: '2025-10-31', permit_expiry: '2025-05-15', fitness_expiry: '2025-11-30' },
  { reg_number: 'JK01AC-3456', type: 'Mini Truck', model: 'Tata Ace', year: 2024, chassis_number: 'TATAACEZ2024004', fuel_type: 'Diesel', capacity_kg: 1000, status: 'Active', insurance_expiry: '2027-01-01', permit_expiry: '2026-01-01', fitness_expiry: '2026-06-15' },
  { reg_number: 'JK01AC-7890', type: 'Truck', model: 'BharatBenz 2823', year: 2023, chassis_number: 'BB2823M2023005', fuel_type: 'Diesel', capacity_kg: 28000, status: 'Active', insurance_expiry: '2026-04-30', permit_expiry: '2026-10-15', fitness_expiry: '2026-12-20' },
  { reg_number: 'JK01AC-1122', type: 'Container Truck', model: 'Eicher Pro 2055', year: 2024, chassis_number: 'EICH2055P2024006', fuel_type: 'Diesel', capacity_kg: 16000, status: 'Active', insurance_expiry: '2027-06-30', permit_expiry: '2026-08-15', fitness_expiry: '2027-03-10' },
];
const stmtV = db.prepare('INSERT INTO vehicles (reg_number, type, model, year, chassis_number, fuel_type, capacity_kg, status, insurance_expiry, permit_expiry, fitness_expiry) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
for (const v of vehicles) stmtV.run(v.reg_number, v.type, v.model, v.year, v.chassis_number, v.fuel_type, v.capacity_kg, v.status, v.insurance_expiry, v.permit_expiry, v.fitness_expiry);

// ─── Drivers ────────────────────────────────────────────────────────────────
const drivers = [
  { name: 'Mohd. Shafi Ganie', phone: '9419012345', email: 'shafi@planettransport.com', license_number: 'JK01-2022-12345', license_expiry: '2027-04-20', emergency_contact: 'Bilal Ahmad', emergency_phone: '9906123456', address: 'Zainakadal, Srinagar', status: 'Active', vehicle_id: 1 },
  { name: 'Gulam Nabi Dar', phone: '9419111222', email: 'gulam@planettransport.com', license_number: 'JK01-2021-67890', license_expiry: '2026-11-15', emergency_contact: 'Farooq Dar', emergency_phone: '9906555666', address: 'Nowhatta, Srinagar', status: 'Active', vehicle_id: 2 },
  { name: 'Bilal Ahmad Wani', phone: '9419456789', email: 'bilal@planettransport.com', license_number: 'JK01-2023-11111', license_expiry: '2028-08-10', emergency_contact: 'Mohd. Shafi', emergency_phone: '9419012345', address: 'Batamaloo, Srinagar', status: 'Active', vehicle_id: 3 },
  { name: 'Irfan Rashid Malik', phone: '7006123456', email: 'irfan@planettransport.com', license_number: 'JK01-2024-22222', license_expiry: '2029-02-28', emergency_contact: 'Gulam Nabi', emergency_phone: '9419111222', address: 'Lal Chowk, Srinagar', status: 'Active', vehicle_id: null },
  { name: 'Farooq Ahmad Dar', phone: '9419567890', email: 'farooq@planettransport.com', license_number: 'JK01-2022-33333', license_expiry: '2027-08-15', emergency_contact: 'Mohd. Shafi', emergency_phone: '9419012345', address: 'Kashmir University, Srinagar', status: 'Active', vehicle_id: null },
  { name: 'Aijaz Hussain Mir', phone: '9906789012', email: 'aijaz@planettransport.com', license_number: 'JK01-2024-44444', license_expiry: '2029-11-20', emergency_contact: 'Bilal Ahmad', emergency_phone: '9419456789', address: 'Pampore, Pulwama', status: 'Active', vehicle_id: 5 },
];
const stmtD = db.prepare('INSERT INTO drivers (name, phone, email, license_number, license_expiry, emergency_contact, emergency_phone, address, status, vehicle_id) VALUES (?,?,?,?,?,?,?,?,?,?)');
for (const d of drivers) stmtD.run(d.name, d.phone, d.email, d.license_number, d.license_expiry, d.emergency_contact, d.emergency_phone, d.address, d.status, d.vehicle_id);

// ─── Delivery Persons ────────────────────────────────────────────────────────
const deliveryPersons = [
  { name: 'Riyaz Ahmad Bhat', phone: '9419001122', vehicle_number: 'JK01AB-1234' },
  { name: 'Mudasir Ahmad Lone', phone: '9906112233', vehicle_number: 'JK01AC-5678' },
  { name: 'Shabir Ahmad Malik', phone: '7006223344', vehicle_number: 'JK01AD-9012' },
  { name: 'Tariq Hussain Shah', phone: '9419334455', vehicle_number: '' },
];
const stmtDP = db.prepare('INSERT INTO delivery_persons (name, phone, vehicle_number) VALUES (?,?,?)');
for (const dp of deliveryPersons) stmtDP.run(dp.name, dp.phone, dp.vehicle_number || null);

// ─── Customers ──────────────────────────────────────────────────────────────
const customers = [
  { name: 'Kashmir Apple Growers', company: 'Kashmir Apple Growers Co-op', phone: '9419000111', email: 'info@kashmirapples.co', address: 'Boulevard Road, Dalgate, Srinagar-190001', gstin: '01AABCG1234H1Z3', customer_type: 'Corporate', account_manager: 'Mohd. Maqbool', tags: ['Export', 'High Volume', 'Premium', 'Cash Customer'] },
  { name: 'Gulmarg Food Products', company: 'Gulmarg Food Products Pvt Ltd', phone: '9906333222', email: 'orders@gulmargfoods.com', address: 'Hyderpora, Srinagar-190014', gstin: '01AACFG5678K1Z5', customer_type: 'Manufacturer', account_manager: 'Ramesh Kumar', tags: ['Fragile Cargo', 'Temperature Controlled'] },
  { name: 'Anantnag Steel Traders', company: 'Anantnag Steel Traders', phone: '9419501234', email: 'anantnagsteel@gmail.com', address: 'Khanabal, Anantnag-192101', gstin: '01AAHAS9012L1Z8', customer_type: 'Distributor', tags: ['High Volume', 'Credit Customer', 'Furniture'] },
  { name: 'Leh Logistics Co.', company: 'Leh Logistics Co.', phone: '9419800012', email: 'dispatch@lehlogistics.com', address: 'Main Bazaar, Leh-194101', gstin: '38AAHLL3456M1Z4', customer_type: 'Corporate', tags: ['Import', 'Cash Customer'] },
  { name: 'Jammu Hardware Store', company: 'Jammu Hardware & Supplies', phone: '7006111222', email: 'jhs@yahoo.com', address: 'Raghunath Bazaar, Jammu-180001', gstin: '01AAAHJ7890N1Z2', customer_type: 'Retailer', tags: ['Cash Customer', 'High Priority'] },
  { name: 'Pahalgam Tourism Board', company: 'Pahalgam Tourism Board', phone: '9906444555', email: 'admin@pahalgamtourism.com', address: 'Pahalgam, Anantnag-192126', gstin: '01AAAPT3333O1Z6', customer_type: 'Government', tags: ['VIP', 'Credit Customer'] },
  { name: 'Srinagar Spice House', company: 'Srinagar Spice House Pvt Ltd', phone: '9419222333', email: 'spices@sshouse.com', address: 'Lal Chowk, Srinagar-190001', gstin: '01AAESS7777M1Z3', customer_type: 'Manufacturer', account_manager: 'Tashi Namgyal', tags: ['Export', 'Premium', 'Pharma'] },
  { name: 'Baramulla Paper Mill', company: 'Baramulla Paper Mill', phone: '9906000444', email: 'info@bmpaper.com', address: 'Kashmir Highway, Baramulla-193101', gstin: '01AAHBP8888K1Z7', customer_type: 'Manufacturer', tags: ['High Volume', 'Credit Customer'] },
  { name: 'Kargil General Traders', company: 'Kargil General Traders', phone: '9419888999', email: 'kgt.kargil@gmail.com', address: 'Main Road, Kargil-194103', gstin: '38AAHKG9999L1Z9', customer_type: 'Distributor', tags: ['Import', 'E-commerce'] },
  { name: 'Jammu Pharma Distributors', company: 'Jammu Pharma Distributors', phone: '7006777888', email: 'info@jammudrugs.com', address: 'Jammu Cantt, Jammu-180003', gstin: '01AAKJP0000P1Z5', customer_type: 'Distributor', account_manager: 'Ramesh Kumar', tags: ['Pharma', 'Fragile Cargo', 'High Priority', 'Credit Customer'] },
];
const stmtC = db.prepare('INSERT INTO customers (customer_no, name, company, phone, email, address, gstin, customer_type, status, account_manager, tags) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
for (const c of customers) {
  const no = `CUST-${String(customers.indexOf(c) + 1).padStart(3, '0')}-2026`;
  stmtC.run(no, c.name, c.company, c.phone, c.email, c.address, c.gstin, c.customer_type, 'Active', c.account_manager || null, JSON.stringify(c.tags));
}

// ─── Warehouses ─────────────────────────────────────────────────────────────
const warehouses = [
  { name: 'Main Warehouse Tengpora', code: 'WH-SGR-01', address: 'Tengpora Bypass, Srinagar-190010', city: 'Srinagar', contact_person: 'Mohd. Maqbool', phone: '9419428505', email: 'warehouse.sgr@planettransport.com', status: 'Active' },
  { name: 'Jammu Transit Warehouse', code: 'WH-JMU-01', address: 'Transport Nagar, Jammu-180012', city: 'Jammu', contact_person: 'Ramesh Kumar', phone: '9419123456', email: 'warehouse.jmu@planettransport.com', status: 'Active' },
  { name: 'Leh Transit Godown', code: 'WH-LEH-01', address: 'Industrial Area, Leh-194101', city: 'Leh', contact_person: 'Tashi Namgyal', phone: '9469123456', email: 'warehouse.leh@planettransport.com', status: 'Active' },
];
const stmtW = db.prepare('INSERT INTO warehouses (code, name, address, city, contact_person, phone, email, status) VALUES (?,?,?,?,?,?,?,?)');
for (const w of warehouses) stmtW.run(w.code, w.name, w.address, w.city, w.contact_person, w.phone, w.email, w.status);

// ─── Bookings (LRR) ─────────────────────────────────────────────────────────
const bookings = [
  {
    booking_no: 'PT-1-2026', lr_date: '2026-07-01', from_location: 'Srinagar', to_location: 'Jammu',
    consignor_name: 'Kashmir Apple Growers', consignor_address: 'Boulevard Road, Dalgate, Srinagar-190001', consignor_gstin: '01AABCG1234H1Z3', consignor_contact: '9419000111',
    consignee_name: 'Jammu Hardware Store', consignee_address: 'Raghunath Bazaar, Jammu-180001', consignee_gstin: '01AAAHJ7890N1Z2', consignee_contact: '7006111222', consignee_delivery_address: 'Raghunath Bazaar, Near Clock Tower, Jammu-180001',
    num_bags: 50, type_of_packing: 'Cartons', said_to_contain: 'Fresh Apples 25 kg each carton', actual_weight: 1250, charged_weight: 1300, private_marka: 'KAG-JMU-01',
    material_invoice_no: 'INV-2026-101', material_invoice_date: '2026-06-30', material_invoice_amt: 875000,
    freight: 15000, eway_bill_charges: 500, previous_freight: 0, door_delivery: 2000, consignment_charges: 300, other_charges: 0,
    total_charges: 17800, discount: 800, grand_total: 17000,
    eway_bill_no: 'EWB-JK-2026-001', eway_expiry_date: '2026-07-08',
    vehicle_id: 1, driver_id: 1, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-2-2026', lr_date: '2026-07-02', from_location: 'Baramulla', to_location: 'Leh',
    consignor_name: 'Gulmarg Food Products', consignor_address: 'Hyderpora, Srinagar-190014', consignor_gstin: '01AACFG5678K1Z5', consignor_contact: '9906333222',
    consignee_name: 'Leh Logistics Co.', consignee_address: 'Main Bazaar, Leh-194101', consignee_gstin: '38AAHLL3456M1Z4', consignee_contact: '9419800012', consignee_delivery_address: 'Leh Main Bazaar, Near Bus Stand, Leh-194101',
    num_bags: 80, type_of_packing: 'Boxes', said_to_contain: 'Dry Fruits Assorted 5 kg boxes', actual_weight: 400, charged_weight: 450, private_marka: 'GFP-LEH-02',
    material_invoice_no: 'INV-2026-202', material_invoice_date: '2026-07-01', material_invoice_amt: 320000,
    freight: 45000, eway_bill_charges: 800, previous_freight: 0, door_delivery: 3000, consignment_charges: 500, other_charges: 0,
    total_charges: 49300, discount: 1300, grand_total: 48000,
    eway_bill_no: 'EWB-JK-2026-002', eway_expiry_date: '2026-07-10',
    vehicle_id: 3, driver_id: 3, status: 'In Progress', loaded: 1, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-3-2026', lr_date: '2026-07-03', from_location: 'Anantnag', to_location: 'Srinagar',
    consignor_name: 'Anantnag Steel Traders', consignor_address: 'Khanabal, Anantnag-192101', consignor_gstin: '01AAHAS9012L1Z8', consignor_contact: '9419501234',
    consignee_name: 'Kashmir Apple Growers', consignee_address: 'Boulevard Road, Dalgate, Srinagar-190001', consignee_gstin: '01AABCG1234H1Z3', consignee_contact: '9419000111', consignee_delivery_address: 'Dalgate, Boulevard Road, Srinagar-190001',
    num_bags: 20, type_of_packing: 'Steel Bundles', said_to_contain: 'Construction Steel TMT Bars', actual_weight: 20000, charged_weight: 21000, private_marka: 'AST-SGR-03',
    material_invoice_no: 'INV-2026-303', material_invoice_date: '2026-07-02', material_invoice_amt: 1260000,
    freight: 12000, eway_bill_charges: 400, previous_freight: 0, door_delivery: 1500, consignment_charges: 250, other_charges: 0,
    total_charges: 14150, discount: 150, grand_total: 14000,
    eway_bill_no: 'EWB-JK-2026-003', eway_expiry_date: '2026-07-09',
    vehicle_id: 2, driver_id: 2, status: 'In Progress', loaded: 1, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-4-2026', lr_date: '2026-07-04', from_location: 'Srinagar', to_location: 'Pahalgam',
    consignor_name: 'Kashmir Apple Growers', consignor_address: 'Boulevard Road, Dalgate, Srinagar-190001', consignor_gstin: '01AABCG1234H1Z3', consignor_contact: '9419000111',
    consignee_name: 'Pahalgam Tourism Board', consignee_address: 'Pahalgam, Anantnag-192126', consignee_gstin: '01AAAPT3333O1Z6', consignee_contact: '9906444555', consignee_delivery_address: 'Main Market, Pahalgam-192126',
    num_bags: 30, type_of_packing: 'Cartons', said_to_contain: 'Organic Vegetables 15 kg cartons', actual_weight: 450, charged_weight: 500, private_marka: 'KAG-PHG-04',
    material_invoice_no: 'INV-2026-404', material_invoice_date: '2026-07-03', material_invoice_amt: 180000,
    freight: 8000, eway_bill_charges: 300, previous_freight: 0, door_delivery: 1000, consignment_charges: 200, other_charges: 0,
    total_charges: 9500, discount: 500, grand_total: 9000,
    eway_bill_no: 'EWB-JK-2026-004', eway_expiry_date: '2026-07-11',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-5-2026', lr_date: '2026-07-05', from_location: 'Leh', to_location: 'Srinagar',
    consignor_name: 'Leh Logistics Co.', consignor_address: 'Main Bazaar, Leh-194101', consignor_gstin: '38AAHLL3456M1Z4', consignor_contact: '9419800012',
    consignee_name: 'Gulmarg Food Products', consignee_address: 'Hyderpora, Srinagar-190014', consignee_gstin: '01AACFG5678K1Z5', consignee_contact: '9906333222', consignee_delivery_address: 'Hyderpora, Near Petrol Pump, Srinagar-190014',
    num_bags: 60, type_of_packing: 'Bags', said_to_contain: 'Sea Buckthorn Juice Bottles 750 ml', actual_weight: 900, charged_weight: 950, private_marka: 'LLC-SGR-05',
    material_invoice_no: 'INV-2026-505', material_invoice_date: '2026-07-04', material_invoice_amt: 450000,
    freight: 35000, eway_bill_charges: 600, previous_freight: 0, door_delivery: 2500, consignment_charges: 400, other_charges: 0,
    total_charges: 38500, discount: 500, grand_total: 38000,
    eway_bill_no: 'EWB-JK-2026-005', eway_expiry_date: '2026-07-12',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-6-2026', lr_date: '2026-07-06', from_location: 'Jammu', to_location: 'Srinagar',
    consignor_name: 'Jammu Hardware Store', consignor_address: 'Raghunath Bazaar, Jammu-180001', consignor_gstin: '01AAAHJ7890N1Z2', consignor_contact: '7006111222',
    consignee_name: 'Anantnag Steel Traders', consignee_address: 'Khanabal, Anantnag-192101', consignee_gstin: '01AAHAS9012L1Z8', consignee_contact: '9419501234', consignee_delivery_address: 'Khanabal, Near Petrol Pump, Anantnag-192101',
    num_bags: 100, type_of_packing: 'Bags', said_to_contain: 'Cement 50 kg bags', actual_weight: 5000, charged_weight: 5200, private_marka: 'JHS-ANT-06',
    material_invoice_no: 'INV-2026-606', material_invoice_date: '2026-07-05', material_invoice_amt: 350000,
    freight: 18000, eway_bill_charges: 500, previous_freight: 2000, door_delivery: 1500, consignment_charges: 300, other_charges: 0,
    total_charges: 22300, discount: 300, grand_total: 22000,
    eway_bill_no: 'EWB-JK-2026-006', eway_expiry_date: '2026-07-13',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-7-2026', lr_date: '2026-07-07', from_location: 'Baramulla', to_location: 'Leh',
    consignor_name: 'Gulmarg Food Products', consignor_address: 'Hyderpora, Srinagar-190014', consignor_gstin: '01AACFG5678K1Z5', consignor_contact: '9906333222',
    consignee_name: 'Leh Logistics Co.', consignee_address: 'Main Bazaar, Leh-194101', consignee_gstin: '38AAHLL3456M1Z4', consignee_contact: '9419800012', consignee_delivery_address: 'Leh Main Bazaar, Near Mosque, Leh-194101',
    num_bags: 120, type_of_packing: 'Cartons', said_to_contain: 'Walnuts Kernels 5 kg cartons', actual_weight: 600, charged_weight: 650, private_marka: 'GFP-LEH-07',
    material_invoice_no: 'INV-2026-707', material_invoice_date: '2026-07-06', material_invoice_amt: 540000,
    freight: 52000, eway_bill_charges: 900, previous_freight: 0, door_delivery: 3500, consignment_charges: 600, other_charges: 200,
    total_charges: 57200, discount: 1200, grand_total: 56000,
    eway_bill_no: 'EWB-JK-2026-007', eway_expiry_date: '2026-07-15',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-8-2026', lr_date: '2026-07-08', from_location: 'Anantnag', to_location: 'Jammu',
    consignor_name: 'Anantnag Steel Traders', consignor_address: 'Khanabal, Anantnag-192101', consignor_gstin: '01AAHAS9012L1Z8', consignor_contact: '9419501234',
    consignee_name: 'Jammu Hardware Store', consignee_address: 'Raghunath Bazaar, Jammu-180001', consignee_gstin: '01AAAHJ7890N1Z2', consignee_contact: '7006111222', consignee_delivery_address: 'Raghunath Bazaar, Opp. Temple, Jammu-180001',
    num_bags: 200, type_of_packing: 'Bundles', said_to_contain: 'GI Pipes 3m length bundles', actual_weight: 8000, charged_weight: 8500, private_marka: 'AST-JMU-08',
    material_invoice_no: 'INV-2026-808', material_invoice_date: '2026-07-07', material_invoice_amt: 480000,
    freight: 22000, eway_bill_charges: 600, previous_freight: 0, door_delivery: 2000, consignment_charges: 400, other_charges: 0,
    total_charges: 25000, discount: 1000, grand_total: 24000,
    eway_bill_no: 'EWB-JK-2026-008', eway_expiry_date: '2026-07-16',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-9-2026', lr_date: '2026-07-09', from_location: 'Srinagar', to_location: 'Jammu',
    consignor_name: 'Kashmir Apple Growers', consignor_address: 'Boulevard Road, Dalgate, Srinagar-190001', consignor_gstin: '01AABCG1234H1Z3', consignor_contact: '9419000111',
    consignee_name: 'Jammu Hardware Store', consignee_address: 'Raghunath Bazaar, Jammu-180001', consignee_gstin: '01AAAHJ7890N2Z1', consignee_contact: '7006111222', consignee_delivery_address: 'Raghunath Bazaar, Jammu-180001',
    num_bags: 40, type_of_packing: 'Cartons', said_to_contain: 'Saffron PGI 100 gm packs', actual_weight: 40, charged_weight: 50, private_marka: 'KAG-JMU-09',
    material_invoice_no: 'INV-2026-909', material_invoice_date: '2026-07-08', material_invoice_amt: 240000,
    freight: 9000, eway_bill_charges: 300, previous_freight: 0, door_delivery: 1000, consignment_charges: 200, other_charges: 0,
    total_charges: 10500, discount: 500, grand_total: 10000,
    eway_bill_no: 'EWB-JK-2026-009', eway_expiry_date: '2026-07-16',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-10-2026', lr_date: '2026-07-10', from_location: 'Jammu', to_location: 'Srinagar',
    consignor_name: 'Jammu Hardware Store', consignor_address: 'Raghunath Bazaar, Jammu-180001', consignor_gstin: '01AAAHJ7890N1Z2', consignor_contact: '7006111222',
    consignee_name: 'Gulmarg Food Products', consignee_address: 'Hyderpora, Srinagar-190014', consignee_gstin: '01AACFG5678K1Z5', consignee_contact: '9906333222', consignee_delivery_address: 'Hyderpora, Near Masjid, Srinagar-190014',
    num_bags: 90, type_of_packing: 'Bags', said_to_contain: 'Basmati Rice 25 kg bags', actual_weight: 2250, charged_weight: 2400, private_marka: 'JHS-SGR-10',
    material_invoice_no: 'INV-2026-010', material_invoice_date: '2026-07-09', material_invoice_amt: 630000,
    freight: 20000, eway_bill_charges: 500, previous_freight: 0, door_delivery: 1500, consignment_charges: 300, other_charges: 100,
    total_charges: 22400, discount: 400, grand_total: 22000,
    eway_bill_no: 'EWB-JK-2026-010', eway_expiry_date: '2026-07-17',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-11-2026', lr_date: '2026-07-11', from_location: 'Srinagar', to_location: 'Leh',
    consignor_name: 'Srinagar Spice House', consignor_address: 'Lal Chowk, Srinagar-190001', consignor_gstin: '01AAESS7777M1Z3', consignor_contact: '9419222333',
    consignee_name: 'Kargil General Traders', consignee_address: 'Main Road, Kargil-194103', consignee_gstin: '38AAHKG9999L1Z9', consignee_contact: '9419888999', consignee_delivery_address: 'Main Road, Near Bus Stop, Kargil-194103',
    num_bags: 300, type_of_packing: 'Bags', said_to_contain: 'Spices Mix 1 kg pouches', actual_weight: 300, charged_weight: 350, private_marka: 'SSH-LEH-11',
    material_invoice_no: 'INV-2026-111', material_invoice_date: '2026-07-10', material_invoice_amt: 450000,
    freight: 58000, eway_bill_charges: 1000, previous_freight: 0, door_delivery: 4000, consignment_charges: 700, other_charges: 300,
    total_charges: 64000, discount: 2000, grand_total: 62000,
    eway_bill_no: 'EWB-JK-2026-011', eway_expiry_date: '2026-07-20',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-12-2026', lr_date: '2026-07-12', from_location: 'Baramulla', to_location: 'Srinagar',
    consignor_name: 'Baramulla Paper Mill', consignor_address: 'Kashmir Highway, Baramulla-193101', consignor_gstin: '01AAHBP8888K1Z7', consignor_contact: '9906000444',
    consignee_name: 'Kashmir Apple Growers', consignee_address: 'Boulevard Road, Dalgate, Srinagar-190001', consignee_gstin: '01AABCG1234H1Z3', consignee_contact: '9419000111', consignee_delivery_address: 'Dalgate, Srinagar-190001',
    num_bags: 150, type_of_packing: 'Reams', said_to_contain: 'A4 Paper Reams 5 kg each', actual_weight: 750, charged_weight: 800, private_marka: 'BPM-SGR-12',
    material_invoice_no: 'INV-2026-122', material_invoice_date: '2026-07-11', material_invoice_amt: 225000,
    freight: 11000, eway_bill_charges: 400, previous_freight: 0, door_delivery: 1500, consignment_charges: 300, other_charges: 0,
    total_charges: 13200, discount: 200, grand_total: 13000,
    eway_bill_no: 'EWB-JK-2026-012', eway_expiry_date: '2026-07-19',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-13-2026', lr_date: '2026-07-13', from_location: 'Jammu', to_location: 'Srinagar',
    consignor_name: 'Jammu Pharma Distributors', consignor_address: 'Jammu Cantt, Jammu-180003', consignor_gstin: '01AAKJP0000P1Z5', consignor_contact: '7006777888',
    consignee_name: 'Pahalgam Tourism Board', consignee_address: 'Pahalgam, Anantnag-192126', consignee_gstin: '01AAAPT3333O1Z6', consignee_contact: '9906444555', consignee_delivery_address: 'Main Market, Pahalgam-192126',
    num_bags: 50, type_of_packing: 'Boxes', said_to_contain: 'Pharmaceuticals Medical Kits', actual_weight: 600, charged_weight: 650, private_marka: 'JPD-PHG-13',
    material_invoice_no: 'INV-2026-133', material_invoice_date: '2026-07-12', material_invoice_amt: 890000,
    freight: 16000, eway_bill_charges: 500, previous_freight: 0, door_delivery: 2000, consignment_charges: 400, other_charges: 0,
    total_charges: 18900, discount: 900, grand_total: 18000,
    eway_bill_no: 'EWB-JK-2026-013', eway_expiry_date: '2026-07-20',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-14-2026', lr_date: '2026-07-14', from_location: 'Leh', to_location: 'Baramulla',
    consignor_name: 'Kargil General Traders', consignor_address: 'Main Road, Kargil-194103', consignor_gstin: '38AAHKG9999L1Z9', consignor_contact: '9419888999',
    consignee_name: 'Gulmarg Food Products', consignee_address: 'Hyderpora, Srinagar-190014', consignee_gstin: '01AACFG5678K1Z5', consignee_contact: '9906333222', consignee_delivery_address: 'Hyderpora, Srinagar-190014',
    num_bags: 40, type_of_packing: 'Boxes', said_to_contain: 'Dried Apricots 10 kg boxes', actual_weight: 400, charged_weight: 450, private_marka: 'KGT-BML-14',
    material_invoice_no: 'INV-2026-144', material_invoice_date: '2026-07-13', material_invoice_amt: 160000,
    freight: 34000, eway_bill_charges: 600, previous_freight: 0, door_delivery: 2500, consignment_charges: 500, other_charges: 0,
    total_charges: 37600, discount: 600, grand_total: 37000,
    eway_bill_no: 'EWB-JK-2026-014', eway_expiry_date: '2026-07-22',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-15-2026', lr_date: '2026-07-15', from_location: 'Srinagar', to_location: 'Anantnag',
    consignor_name: 'Kashmir Apple Growers', consignor_address: 'Boulevard Road, Dalgate, Srinagar-190001', consignor_gstin: '01AABCG1234H1Z3', consignor_contact: '9419000111',
    consignee_name: 'Anantnag Steel Traders', consignee_address: 'Khanabal, Anantnag-192101', consignee_gstin: '01AAHAS9012L1Z8', consignee_contact: '9419501234', consignee_delivery_address: 'Khanabal, Anantnag-192101',
    num_bags: 25, type_of_packing: 'Boxes', said_to_contain: 'Premium Dry Fruit Gift Boxes', actual_weight: 125, charged_weight: 150, private_marka: 'KAG-ANT-15',
    material_invoice_no: 'INV-2026-155', material_invoice_date: '2026-07-14', material_invoice_amt: 312500,
    freight: 5000, eway_bill_charges: 200, previous_freight: 0, door_delivery: 800, consignment_charges: 150, other_charges: 0,
    total_charges: 6150, discount: 150, grand_total: 6000,
    eway_bill_no: 'EWB-JK-2026-015', eway_expiry_date: '2026-07-22',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-16-2026', lr_date: '2026-07-16', from_location: 'Jammu', to_location: 'Leh',
    consignor_name: 'Jammu Hardware Store', consignor_address: 'Raghunath Bazaar, Jammu-180001', consignor_gstin: '01AAAHJ7890N1Z2', consignor_contact: '7006111222',
    consignee_name: 'Leh Logistics Co.', consignee_address: 'Main Bazaar, Leh-194101', consignee_gstin: '38AAHLL3456M1Z4', consignee_contact: '9419800012', consignee_delivery_address: 'Leh Main Bazaar, Near Mosque, Leh-194101',
    num_bags: 180, type_of_packing: 'Bundles', said_to_contain: 'Construction Steel TMT 12mm', actual_weight: 9000, charged_weight: 9500, private_marka: 'JHS-LEH-16',
    material_invoice_no: 'INV-2026-166', material_invoice_date: '2026-07-15', material_invoice_amt: 585000,
    freight: 65000, eway_bill_charges: 1200, previous_freight: 0, door_delivery: 5000, consignment_charges: 800, other_charges: 0,
    total_charges: 72000, discount: 2000, grand_total: 70000,
    eway_bill_no: 'EWB-JK-2026-016', eway_expiry_date: '2026-07-25',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-17-2026', lr_date: '2026-07-17', from_location: 'Anantnag', to_location: 'Srinagar',
    consignor_name: 'Anantnag Steel Traders', consignor_address: 'Khanabal, Anantnag-192101', consignor_gstin: '01AAHAS9012L1Z8', consignor_contact: '9419501234',
    consignee_name: 'Srinagar Spice House', consignee_address: 'Lal Chowk, Srinagar-190001', consignee_gstin: '01AAESS7777M1Z3', consignee_contact: '9419222333', consignee_delivery_address: 'Lal Chowk, Srinagar-190001',
    num_bags: 10, type_of_packing: 'Drums', said_to_contain: 'Industrial Lubricant 200L drums', actual_weight: 2000, charged_weight: 2100, private_marka: 'AST-SGR-17',
    material_invoice_no: 'INV-2026-177', material_invoice_date: '2026-07-16', material_invoice_amt: 350000,
    freight: 8000, eway_bill_charges: 300, previous_freight: 0, door_delivery: 1000, consignment_charges: 200, other_charges: 0,
    total_charges: 9500, discount: 500, grand_total: 9000,
    eway_bill_no: 'EWB-JK-2026-017', eway_expiry_date: '2026-07-24',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-18-2026', lr_date: '2026-07-18', from_location: 'Srinagar', to_location: 'Kargil',
    consignor_name: 'Gulmarg Food Products', consignor_address: 'Hyderpora, Srinagar-190014', consignor_gstin: '01AACFG5678K1Z5', consignor_contact: '9906333222',
    consignee_name: 'Kargil General Traders', consignee_address: 'Main Road, Kargil-194103', consignee_gstin: '38AAHKG9999L1Z9', consignee_contact: '9419888999', consignee_delivery_address: 'Main Road, Kargil-194103',
    num_bags: 200, type_of_packing: 'Cartons', said_to_contain: 'Packaged Dry Fruits 500 gm packs', actual_weight: 1000, charged_weight: 1100, private_marka: 'GFP-KGL-18',
    material_invoice_no: 'INV-2026-188', material_invoice_date: '2026-07-17', material_invoice_amt: 600000,
    freight: 55000, eway_bill_charges: 1000, previous_freight: 0, door_delivery: 4000, consignment_charges: 700, other_charges: 300,
    total_charges: 61000, discount: 1000, grand_total: 60000,
    eway_bill_no: 'EWB-JK-2026-018', eway_expiry_date: '2026-07-26',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-19-2026', lr_date: '2026-07-19', from_location: 'Srinagar', to_location: 'Jammu',
    consignor_name: 'Pahalgam Tourism Board', consignor_address: 'Pahalgam, Anantnag-192126', consignor_gstin: '01AAAPT3333O1Z6', consignor_contact: '9906444555',
    consignee_name: 'Jammu Pharma Distributors', consignee_address: 'Jammu Cantt, Jammu-180003', consignee_gstin: '01AAKJP0000P1Z5', consignee_contact: '7006777888', consignee_delivery_address: 'Jammu Cantt, Near Railway Station, Jammu-180003',
    num_bags: 15, type_of_packing: 'Boxes', said_to_contain: 'Tourist Souvenir Items', actual_weight: 75, charged_weight: 80, private_marka: 'PTB-JMU-19',
    material_invoice_no: 'INV-2026-199', material_invoice_date: '2026-07-18', material_invoice_amt: 75000,
    freight: 7000, eway_bill_charges: 200, previous_freight: 0, door_delivery: 1000, consignment_charges: 200, other_charges: 0,
    total_charges: 8400, discount: 400, grand_total: 8000,
    eway_bill_no: 'EWB-JK-2026-019', eway_expiry_date: '2026-07-26',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
  {
    booking_no: 'PT-20-2026', lr_date: '2026-07-20', from_location: 'Leh', to_location: 'Jammu',
    consignor_name: 'Leh Logistics Co.', consignor_address: 'Main Bazaar, Leh-194101', consignor_gstin: '38AAHLL3456M1Z4', consignor_contact: '9419800012',
    consignee_name: 'Baramulla Paper Mill', consignee_address: 'Kashmir Highway, Baramulla-193101', consignee_gstin: '01AAHBP8888K1Z7', consignee_contact: '9906000444', consignee_delivery_address: 'Kashmir Highway, Baramulla-193101',
    num_bags: 75, type_of_packing: 'Bales', said_to_contain: 'Waste Paper Bales for Recycling', actual_weight: 7500, charged_weight: 8000, private_marka: 'LLC-JMU-20',
    material_invoice_no: 'INV-2026-200', material_invoice_date: '2026-07-19', material_invoice_amt: 150000,
    freight: 42000, eway_bill_charges: 800, previous_freight: 0, door_delivery: 3000, consignment_charges: 500, other_charges: 0,
    total_charges: 46300, discount: 1300, grand_total: 45000,
    eway_bill_no: 'EWB-JK-2026-020', eway_expiry_date: '2026-07-28',
    vehicle_id: null, driver_id: null, status: 'Booked', loaded: 0, delivered: 0, received: 0,
  },
];

const BOOKING_COLS = [
  'booking_no', 'lr_date', 'from_location', 'to_location',
  'consignor_name', 'consignor_address', 'consignor_gstin', 'consignor_contact',
  'consignee_name', 'consignee_address', 'consignee_gstin', 'consignee_contact', 'consignee_delivery_address',
  'num_bags', 'type_of_packing', 'said_to_contain', 'actual_weight', 'charged_weight', 'private_marka',
  'material_invoice_no', 'material_invoice_date', 'material_invoice_amt',
  'freight', 'eway_bill_charges', 'previous_freight', 'door_delivery', 'consignment_charges', 'other_charges',
  'total_charges', 'discount', 'grand_total',
  'eway_bill_no', 'eway_expiry_date',
  'vehicle_id', 'driver_id', 'status', 'loaded', 'delivered', 'received',
];

const stmtB = db.prepare(`INSERT INTO bookings (${BOOKING_COLS.join(', ')}) VALUES (${BOOKING_COLS.map(() => '?').join(', ')})`);
for (const b of bookings) stmtB.run(...BOOKING_COLS.map((c) => (b as any)[c] ?? null));

// ─── Loadings ───────────────────────────────────────────────────────────────
const loadingStmt = db.prepare('INSERT INTO loadings (loading_no, vehicle_id, driver_id, loading_date) VALUES (?,?,?,?)');
const loadingItemStmt = db.prepare('INSERT INTO loading_items (loading_id, booking_id) VALUES (?, ?)');
const loadBookingStmt = db.prepare('UPDATE bookings SET loaded = 1 WHERE id = ?');

// Loading 1: Vehicle JK01AC-1234 (id=1), Driver Mohd. Shafi Ganie (id=1), Booking 1 (PT-01)
const l1 = loadingStmt.run('LD-240701', 1, 1, '2026-07-01');
loadingItemStmt.run(l1.lastInsertRowid, 1);
loadBookingStmt.run(1);

// Loading 2: Vehicle JK01AC-5678 (id=2), Driver Gulam Nabi (id=2), Bookings 3 (PT-03)
const l2 = loadingStmt.run('LD-240702', 2, 2, '2026-07-03');
loadingItemStmt.run(l2.lastInsertRowid, 3);
loadBookingStmt.run(3);

// Loading 3: Vehicle JK01AC-9012 (id=3), Driver Bilal Ahmad (id=3), Booking 2 (PT-02)
const l3 = loadingStmt.run('LD-240703', 3, 3, '2026-07-02');
loadingItemStmt.run(l3.lastInsertRowid, 2);
loadBookingStmt.run(2);

// Loading 4: Vehicle JK01AC-1234 (id=1), Driver Mohd. Shafi Ganie (id=1), Bookings 4 & 6 combined
const l4 = loadingStmt.run('LD-240704', 1, 1, '2026-07-04');
loadingItemStmt.run(l4.lastInsertRowid, 4);
loadingItemStmt.run(l4.lastInsertRowid, 6);
loadBookingStmt.run(4);
loadBookingStmt.run(6);

// Loading 5: Vehicle JK01AC-5678 (id=2), Driver Gulam Nabi (id=2), Booking 7
const l5 = loadingStmt.run('LD-240705', 2, 2, '2026-07-08');
loadingItemStmt.run(l5.lastInsertRowid, 7);
loadBookingStmt.run(7);

// Loading 6: Vehicle JK01AC-9012 (id=3), Driver Bilal Ahmad (id=3), Booking 8
const l6 = loadingStmt.run('LD-240706', 3, 3, '2026-07-09');
loadingItemStmt.run(l6.lastInsertRowid, 8);
loadBookingStmt.run(8);

// Loading 7: Vehicle JK01AC-7890 (id=5), Driver Aijaz Hussain (id=6), Bookings 9 & 10
const l7 = loadingStmt.run('LD-240707', 5, 6, '2026-07-11');
loadingItemStmt.run(l7.lastInsertRowid, 9);
loadingItemStmt.run(l7.lastInsertRowid, 10);
loadBookingStmt.run(9);
loadBookingStmt.run(10);

// Loading 8: Vehicle JK01AC-3456 (id=4), Driver Irfan Rashid (id=4), Bookings 11 & 12
const l8 = loadingStmt.run('LD-240708', 4, 4, '2026-07-13');
loadingItemStmt.run(l8.lastInsertRowid, 11);
loadingItemStmt.run(l8.lastInsertRowid, 12);
loadBookingStmt.run(11);
loadBookingStmt.run(12);

// Loading 9: Vehicle JK01AC-5678 (id=2), Driver Gulam Nabi (id=2), Bookings 13 & 14
const l9 = loadingStmt.run('LD-240709', 2, 2, '2026-07-14');
loadingItemStmt.run(l9.lastInsertRowid, 13);
loadingItemStmt.run(l9.lastInsertRowid, 14);
loadBookingStmt.run(13);
loadBookingStmt.run(14);

// ─── Receivings ─────────────────────────────────────────────────────────────
const recvStmt = db.prepare('INSERT INTO receivings (receiving_no, vehicle_id, warehouse_id, driver_name, driver_phone, license_number, receiving_date, notes) VALUES (?,?,?,?,?,?,?,?)');
const recvItemStmt = db.prepare('INSERT INTO receiving_items (receiving_id, booking_id, bags_received, short_bags, notes) VALUES (?,?,?,?,?)');
const recvBookingStmt = db.prepare('UPDATE bookings SET received = 1 WHERE id = ?');

// Receiving 1: Vehicle 1 (JK01AC-1234, 1st trip) at Main Warehouse — 2 bags shortage
const r1 = recvStmt.run('RCV-240701', 1, 1, 'Mohd. Shafi Ganie', '9419012345', 'JK01-2022-12345', '2026-07-02', '2 cartons damaged in transit');
recvItemStmt.run(r1.lastInsertRowid, 1, 48, 2, '2 cartons apples damaged — discarded');
recvBookingStmt.run(1);

// Receiving 2: Vehicle 2 (JK01AC-5678) at Jammu Transit Warehouse — full receipt
const r2 = recvStmt.run('RCV-240702', 2, 2, 'Gulam Nabi Dar', '9419111222', 'JK01-2021-67890', '2026-07-05', 'All good');
recvItemStmt.run(r2.lastInsertRowid, 3, 20, 0, null);
recvBookingStmt.run(3);

// Receiving 3: Vehicle 3 (JK01AC-9012) at Main Warehouse — 3 bags shortage
const r3 = recvStmt.run('RCV-240703', 3, 1, 'Bilal Ahmad Wani', '9419456789', 'JK01-2023-11111', '2026-07-05', '3 boxes found open');
recvItemStmt.run(r3.lastInsertRowid, 2, 77, 3, '3 boxes seal broken — contents partially missing');
recvBookingStmt.run(2);

// Receiving 4: Vehicle 1 (JK01AC-1234, 2nd trip) at Main Warehouse — booking 4 exact, booking 6 shortage 5 bags
const r4 = recvStmt.run('RCV-240704', 1, 1, 'Mohd. Shafi Ganie', '9419012345', 'JK01-2022-12345', '2026-07-06', 'Partially received');
recvItemStmt.run(r4.lastInsertRowid, 4, 30, 0, 'All vegetables received fresh');
recvItemStmt.run(r4.lastInsertRowid, 6, 95, 5, '5 cement bags torn — material lost');
recvBookingStmt.run(4);
recvBookingStmt.run(6);

// Receiving 5: Vehicle 5 (JK01AC-7890) at Main Warehouse — both exact
const r5 = recvStmt.run('RCV-240705', 5, 1, 'Aijaz Hussain Mir', '9906789012', 'JK01-2024-44444', '2026-07-13', 'All goods received intact');
recvItemStmt.run(r5.lastInsertRowid, 9, 40, 0, null);
recvItemStmt.run(r5.lastInsertRowid, 10, 90, 0, null);
recvBookingStmt.run(9);
recvBookingStmt.run(10);

// Receiving 6: Vehicle 4 (JK01AC-3456) at Jammu Transit Warehouse — booking 12 exact, booking 11 shortage 10 bags
const r6 = recvStmt.run('RCV-240706', 4, 2, 'Irfan Rashid Malik', '7006123456', 'JK01-2024-22222', '2026-07-15', '10 pouches found tampered');
recvItemStmt.run(r6.lastInsertRowid, 11, 290, 10, '10 spice pouches seals broken — rejected');
recvItemStmt.run(r6.lastInsertRowid, 12, 150, 0, 'Paper reams received in good condition');
recvBookingStmt.run(11);
recvBookingStmt.run(12);

// ─── Deliveries ────────────────────────────────────────────────────────────
const delStmt = db.prepare('INSERT INTO deliveries (delivery_no, delivery_date, delivery_person_id) VALUES (?,?,?)');
const delItemStmt = db.prepare('INSERT INTO delivery_items (delivery_id, booking_id) VALUES (?, ?)');
const delBookingStmt = db.prepare('UPDATE bookings SET delivered = 1 WHERE id = ?');

// Delivery 1: Booking 1 — Riyaz Ahmad (dp 1)
const d1 = delStmt.run('DLV-240702', '2026-07-03', 1);
delItemStmt.run(d1.lastInsertRowid, 1);
delBookingStmt.run(1);

// Delivery 2: Booking 3 — Mudasir Ahmad (dp 2)
const d2 = delStmt.run('DLV-240705', '2026-07-06', 2);
delItemStmt.run(d2.lastInsertRowid, 3);
delBookingStmt.run(3);

// Delivery 3: Booking 4 — Shabir Ahmad (dp 3)
const d3 = delStmt.run('DLV-240706', '2026-07-07', 3);
delItemStmt.run(d3.lastInsertRowid, 4);
delBookingStmt.run(4);

// Delivery 4: Booking 9 — Riyaz Ahmad (dp 1)
const d4 = delStmt.run('DLV-240714', '2026-07-14', 1);
delItemStmt.run(d4.lastInsertRowid, 9);
delBookingStmt.run(9);

// Delivery 5: Booking 10 — Mudasir Ahmad (dp 2)
const d5 = delStmt.run('DLV-240715', '2026-07-15', 2);
delItemStmt.run(d5.lastInsertRowid, 10);
delBookingStmt.run(10);

// Delivery 6: Booking 12 — Tariq Hussain (dp 4)
const d6 = delStmt.run('DLV-240716', '2026-07-16', 4);
delItemStmt.run(d6.lastInsertRowid, 12);
delBookingStmt.run(12);

// Update statuses to reflect workflow
db.prepare("UPDATE bookings SET status = 'In Progress' WHERE loaded = 1 AND delivered = 0 AND received = 0").run();
db.prepare("UPDATE bookings SET status = 'Unloaded' WHERE received = 1 AND delivered = 0").run();
db.prepare("UPDATE bookings SET status = 'Completed' WHERE delivered = 1").run();

// ─── Sample Expenses ──────────────────────────────────────────────────────────
const EXPENSE_COLS = ['voucher_no', 'expense_date', 'posting_date', 'expense_type', 'expense_category', 'status', 'branch', 'vehicle_id', 'department', 'vendor_name', 'vendor_type', 'description', 'amount', 'total_amount', 'payment_status', 'payment_mode', 'reference_no', 'notes'];
const sampleExpenses = [
  { voucher_no: 'EXP-2026-000001', expense_date: '2026-07-02', posting_date: '2026-07-02', expense_type: 'Fuel', expense_category: 'Fuel', status: 'Paid', branch: 'Srinagar', vehicle_id: 1, department: 'Operations', vendor_name: 'Indian Oil Corp', vendor_type: 'Fuel Supplier', description: 'Diesel fill JK01AC-1234', amount: 8500, total_amount: 8500, payment_status: 'Paid', payment_mode: 'Bank Transfer', reference_no: 'IO-2026-4501', notes: 'Regular fuel top-up' },
  { voucher_no: 'EXP-2026-000002', expense_date: '2026-07-05', posting_date: '2026-07-05', expense_type: 'Maintenance', expense_category: 'Repair', status: 'Pending Approval', branch: 'Srinagar', vehicle_id: 3, department: 'Operations', vendor_name: 'Kashmir Auto Works', vendor_type: 'Service Center', description: 'Brake pad replacement JK01AC-9012', amount: 3200, total_amount: 3200, payment_status: 'Unpaid', payment_mode: 'Cash', notes: 'Invoice KAW-2026-89' },
  { voucher_no: 'EXP-2026-000003', expense_date: '2026-07-08', posting_date: '2026-07-08', expense_type: 'Office', expense_category: 'Office Supplies', status: 'Approved', branch: 'Srinagar', department: 'Administration', vendor_name: 'SPR Stationers', vendor_type: 'Vendor', description: 'Office stationery & printing paper', amount: 2450, total_amount: 2450, payment_status: 'Paid', payment_mode: 'Cash', reference_no: 'SPR-2026-112' },
  { voucher_no: 'EXP-2026-000004', expense_date: '2026-07-10', posting_date: '2026-07-10', expense_type: 'Travel', expense_category: 'Toll', status: 'Paid', branch: 'Srinagar', vehicle_id: 2, department: 'Operations', vendor_name: 'NH Toll Plaza', vendor_type: 'Government', description: 'Srinagar-Jammu highway toll', amount: 1200, total_amount: 1200, payment_status: 'Paid', payment_mode: 'UPI', reference_no: 'UPI-TXN-789012' },
  { voucher_no: 'EXP-2026-000005', expense_date: '2026-07-12', posting_date: '2026-07-12', expense_type: 'Utilities', expense_category: 'Electricity', status: 'Posted', branch: 'Srinagar', department: 'Administration', vendor_name: 'J&K Power Corp', vendor_type: 'Utility', description: 'Warehouse electricity bill July 2026', amount: 18500, total_amount: 18500, payment_status: 'Unpaid', payment_mode: 'Bank Transfer', notes: 'Meter reading submitted' },
];
const stmtExp = db.prepare(`INSERT INTO expenses (${EXPENSE_COLS.join(', ')}) VALUES (${EXPENSE_COLS.map(() => '?').join(', ')})`);
for (const e of sampleExpenses) stmtExp.run(...EXPENSE_COLS.map((c) => (e as any)[c] ?? null));

console.log('Seed data inserted successfully!');
console.log(`  Vehicles: ${vehicles.length}`);
console.log(`  Drivers: ${drivers.length}`);
console.log(`  Delivery Persons: ${deliveryPersons.length}`);
console.log(`  Customers: ${customers.length}`);
console.log(`  Warehouses: ${warehouses.length}`);
console.log(`  Bookings: ${bookings.length}`);
console.log(`  Loadings: 9`);
console.log(`  Receivings: 6`);
console.log(`    RCV-240701: Veh 1 → Main WH — short 2 (BK-01)`);
console.log(`    RCV-240702: Veh 2 → Jammu WH — exact (BK-03)`);
console.log(`    RCV-240703: Veh 3 → Main WH — short 3 (BK-02)`);
console.log(`    RCV-240704: Veh 1 → Main WH — short 5 (BK-06)`);
console.log(`    RCV-240705: Veh 5 → Main WH — exact (BK-09, BK-10)`);
console.log(`    RCV-240706: Veh 4 → Jammu WH — short 10 (BK-11)`);
console.log(`  Deliveries: 6`);

// ─── Super Admin ────────────────────────────────────────────────────────────
import bcrypt from 'bcryptjs';
const hashedPwd = bcrypt.hashSync('admin', 10);
db.prepare('INSERT INTO users (username, password, role, allowed_modules) VALUES (?,?,?,?)').run(
  'admin', hashedPwd, 'super_admin', '[]'
);
console.log('  Super Admin: admin / admin');
console.log(`  Expenses: ${sampleExpenses.length}`);
console.log(`    ${sampleExpenses.map((e) => e.voucher_no).join(', ')}`);
