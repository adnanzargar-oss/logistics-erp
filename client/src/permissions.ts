export const MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'customers', label: 'Customers' },
  { id: 'warehouses', label: 'Warehouses' },
  { id: 'loadings', label: 'Loading' },
  { id: 'receivings', label: 'Receiving' },
  { id: 'deliveries', label: 'Deliveries' },
  { id: 'pod', label: 'POD' },
  { id: 'fuel', label: 'Fuel Tracking' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'payments', label: 'Payments' },
  { id: 'barcodes', label: 'Barcodes' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'reports', label: 'Reports' },
  { id: 'dataio', label: 'Data Import/Export' },
];

export const SUBMODULES: Record<string, { id: string; label: string }[]> = {
  bookings: [
    { id: 'today', label: 'Today' },
    { id: 'history', label: 'History' },
  ],
  loadings: [
    { id: 'new', label: 'New Loading' },
    { id: 'transit', label: 'In Transit' },
    { id: 'history', label: 'History' },
  ],
  deliveries: [
    { id: 'send', label: 'Send for Delivery' },
    { id: 'delivered', label: 'Confirm Delivery' },
    { id: 'dlrs', label: 'Delivered LRs' },
  ],
};

export const ALL_ACTIONS = ['create', 'edit', 'delete'] as const;
export type Action = (typeof ALL_ACTIONS)[number];

export type ModulePerm = {
  tabs: string[];
  actions: Action[];
};

export type ModulePermissions = Record<string, ModulePerm>;

export function hasSubModule(perms: ModulePermissions | null, moduleId: string, subModuleId: string): boolean {
  if (!perms) return true;
  const perm = perms[moduleId];
  if (!perm) return false;
  return perm.tabs.length === 0 || perm.tabs[0] === '*' || perm.tabs.includes(subModuleId);
}

export function hasAction(perms: ModulePermissions | null, moduleId: string, action: Action): boolean {
  if (!perms) return true;
  const perm = perms[moduleId];
  if (!perm) return false;
  return perm.actions.includes(action);
}
