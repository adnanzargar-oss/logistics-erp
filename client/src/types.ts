export interface Vehicle {
  id?: number;
  reg_number: string;
  type: string;
  model?: string;
  year?: number;
  chassis_number?: string;
  fuel_type?: string;
  capacity_kg?: number;
  status?: string;
  insurance_expiry?: string;
  permit_expiry?: string;
  fitness_expiry?: string;
  active_trips?: number;
}

export interface Driver {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  license_number?: string;
  license_expiry?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  address?: string;
  status?: string;
  vehicle_id?: number;
  vehicle_reg?: string;
}

export interface Customer {
  id?: number;
  customer_no?: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  customer_type?: string;
  status?: string;
  account_manager?: string;
  tags?: string[];
  total_bookings?: number;
  total_invoiced?: number;
  total_nags_received?: number;
}

export interface Warehouse {
  id?: number;
  code?: string;
  name: string;
  address?: string;
  city?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  status?: string;
  total_bookings?: number;
  pickup_bookings?: number;
  delivery_bookings?: number;
  total_loadings?: number;
  total_receivings?: number;
  total_nags_received?: number;
  total_shortage?: number;
  total_deliveries?: number;
}

export interface Booking {
  id?: number;
  booking_no: string;
  customer_id?: number;
  vehicle_id?: number;
  driver_id?: number;
  pickup_location?: string;
  delivery_location?: string;
  pickup_warehouse_id?: number;
  delivery_warehouse_id?: number;
  pickup_date?: string;
  delivery_date?: string;
  lr_date?: string;
  from_location?: string;
  to_location?: string;
  status?: string;
  eway_bill_no?: string;
  eway_expiry_date?: string;
  invoice_no?: string;
  notes?: string;
  customer_name?: string;
  customer_company?: string;
  vehicle_reg?: string;
  vehicle_type?: string;
  driver_name?: string;
  driver_phone?: string;

  // LRR fields
  consignor_name?: string;
  consignor_address?: string;
  consignor_gstin?: string;
  consignor_contact?: string;
  consignee_name?: string;
  consignee_address?: string;
  consignee_gstin?: string;
  consignee_contact?: string;
  consignee_delivery_address?: string;
  num_bags?: number;
  type_of_packing?: string;
  said_to_contain?: string;
  actual_weight?: number;
  charged_weight?: number;
  private_marka?: string;
  material_invoice_no?: string;
  material_invoice_date?: string;
  material_invoice_amt?: number;
  freight?: number;
  eway_bill_charges?: number;
  previous_freight?: number;
  door_delivery?: number;
  consignment_charges?: number;
  other_charges?: number;
  total_charges?: number;
  discount?: number;
  grand_total?: number;
  paid?: number;
  paid_by?: string;

  loaded?: number;
  delivered?: number;
  out_for_delivery?: number;

  // Legacy fields
  material?: string;
  weight_kg?: number;
  distance_km?: number;
  rate_type?: string;
  rate_amount?: number;
  total_amount?: number;
}

export interface Loading {
  id?: number;
  loading_no: string;
  vehicle_id?: number;
  driver_id?: number;
  loading_date?: string;
  status?: string;
  vehicle_reg?: string;
  driver_name?: string;
  license_number?: string;
  item_count?: number;
  bookings?: Booking[];
}

export interface FuelEntry {
  id?: number;
  vehicle_id: number;
  fuel_date: string;
  quantity_ltr: number;
  cost_per_ltr: number;
  total_cost: number;
  odometer_km?: number;
  station_name?: string;
  payment_type?: string;
  paid_by?: string;
  notes?: string;
  vehicle_reg?: string;
}

export interface MaintenanceRecord {
  id?: number;
  vehicle_id: number;
  service_date: string;
  service_type: string;
  description?: string;
  odometer_km?: number;
  labor_cost?: number;
  parts_cost?: number;
  tax_amount?: number;
  total_cost?: number;
  provider_name?: string;
  next_service_date?: string;
  next_service_km?: number;
  status?: string;
  vehicle_reg?: string;
}

export interface Invoice {
  id?: number;
  invoice_no: string;
  customer_id?: number;
  booking_id?: number;
  invoice_type?: string;
  invoice_date: string;
  due_date?: string;
  subtotal?: number;
  tax_percent?: number;
  tax_amount?: number;
  total_amount: number;
  paid_amount?: number;
  status?: string;
  notes?: string;
  customer_name?: string;
  customer_company?: string;
  customer_address?: string;
  customer_phone?: string;
  customer_gstin?: string;
}

export interface Payment {
  id?: number;
  payment_no: string;
  payment_type: string;
  party_type: string;
  party_id?: number;
  party_name?: string;
  invoice_id?: number;
  amount: number;
  payment_date: string;
  payment_mode?: string;
  reference_no?: string;
  notes?: string;
}

export interface Expense {
  id?: number;
  vehicle_id?: number;
  vehicle_reg?: string;

  // Basic Information
  voucher_no?: string;
  expense_date: string;
  posting_date?: string;
  expense_type?: string;
  expense_category: string;
  status?: string;
  branch?: string;
  warehouse_id?: number;
  department?: string;
  cost_center?: string;
  project?: string;

  // Vendor / Payee
  vendor_name?: string;
  vendor_code?: string;
  vendor_type?: string;
  contact_person?: string;
  phone?: string;
  vendor_email?: string;
  vendor_address?: string;
  trn_vat_number?: string;

  // Expense Details
  expense_head?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_cost?: number;
  amount: number;
  tax_percentage?: number;
  tax_amount?: number;
  total_amount?: number;

  // Payment Details
  payment_status?: string;
  payment_mode?: string;
  bank_account?: string;
  cheque_number?: string;
  reference_no?: string;
  payment_date?: string;
  currency?: string;
  exchange_rate?: number;

  // Internal Notes
  notes?: string;
}

export interface DeliveryPerson {
  id?: number;
  name: string;
  phone?: string;
  vehicle_number?: string;
  status?: string;
}

export interface ReceivingItem {
  id?: number;
  receiving_id?: number;
  booking_id: number;
  booking_no?: string;
  bags_received: number;
  short_bags?: number;
  num_bags?: number;
  notes?: string;
  consignor_name?: string;
  consignee_name?: string;
  from_location?: string;
  to_location?: string;
  actual_weight?: number;
  charged_weight?: number;
  eway_bill_no?: string;
  freight?: number;
  grand_total?: number;
  lr_date?: string;
}

export interface Receiving {
  id?: number;
  receiving_no: string;
  vehicle_id?: number;
  warehouse_id?: number;
  driver_name?: string;
  driver_phone?: string;
  license_number?: string;
  receiving_date?: string;
  status?: string;
  notes?: string;
  vehicle_reg?: string;
  warehouse_name?: string;
  item_count?: number;
  bookings?: ReceivingItem[];
}

export interface DashboardData {
  bookings: { total_bookings: number; completed: number; in_progress: number; booked: number };
  vehicles: { total: number; active: number };
  drivers: { total: number; active: number };
  invoices: { total: number; total_amount: number; paid_amount: number; outstanding: number };
  payments: { total_payments: number; total_amount: number };
  fuel: { total_entries: number; total_liters: number; total_cost: number };
  monthlyBookings: { month: string; count: number }[];
  recentBookings: { id: number; booking_no: string; consignor_name: string; consignee_name: string; grand_total: number; status: string; created_at: string }[];
  loadingStats: { total: number; in_transit: number; received: number };
  customerCount: number;
}
