import {
  LayoutDashboard, Truck, BookOpen,
  Fuel, Wrench, FileText, Banknote, Receipt, BarChart3,
  Building2, Warehouse, PackageCheck, Package, Barcode, CalendarDays,
  ChevronLeft, ChevronRight, ArrowDownToLine, Menu, X, ClipboardCheck
} from 'lucide-react';
import { useState } from 'react';
import type { ModulePermissions } from '../permissions';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'fleet', label: 'Fleet', icon: Truck },
  { id: 'customers', label: 'Customers', icon: Building2 },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
  { id: 'loadings', label: 'Loading', icon: PackageCheck },
  { id: 'receivings', label: 'Receiving', icon: ArrowDownToLine },
  { id: 'deliveries', label: 'Deliveries', icon: Package },
  { id: 'pod', label: 'POD', icon: ClipboardCheck },
  { id: 'fuel', label: 'Fuel Tracking', icon: Fuel },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'payments', label: 'Payments', icon: Banknote },
  { id: 'barcodes', label: 'Barcodes', icon: Barcode },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ current, onNavigate, mobileOpen, onMobileClose, allowedModules }: {
  current: string; onNavigate: (id: string) => void;
  mobileOpen: boolean; onMobileClose: () => void;
  allowedModules: ModulePermissions | null;
}) {
  const filteredItems = allowedModules
  ? menuItems.filter((m) => m.id in allowedModules)
  : menuItems;

  const [collapsed, setCollapsed] = useState(false);

 const handleNav = (id: string) => {
 onNavigate(id);
 onMobileClose();
 };

 const sidebarContent = (
 <>
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 468.62 308.07" className="w-5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ef453c" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24ZM140.3,159.38c5.43-20.2,10.72-21.22-12.53-25.83-6.58-2.1-5.93,9.46-8.64,13.48-4.76,10.27,14.8,8.25,21.17,12.36ZM235.79,132.05c6.24-.95,4.53-15.02,7.61-20.62-2.49-3.49-16.04-6.4-18.28-.63-6.74,21.67-12.66,16.33,10.68,21.25ZM195.9,174.31c-5.08,4.63-7.12,12.65-3.31,19.31,11.39,7.55,17.62-24.24,3.31-19.31ZM363.57,169.58c0-.19.01-.37.02-.56-74.01-8.8-74.42,6.46-.02.56ZM310.6,156.75c17.77,1.08,34.62,1.35,51.97,2.72-10.91-.92-48.76-14.53-51.97-2.72ZM362.57,149.68c.05-.2.1-.4.15-.6-63.25-20.67-66.13-6.53-.15.6ZM362.37,138.24c.1-.24.21-.47.31-.71-58.85-24-62.7-12.29-.31.71ZM320.79,111.9c10.24,3.66,22.28,9.45,32.54,10.67-5.36-2.2-32.29-20.07-32.54-10.67Z"/>
              <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
            </svg>
            <span className="font-semibold text-base tracking-tight text-gray-800">PlanetERP</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          )}
          <button onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 md:hidden transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-3 mb-1">
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100">
            <ChevronLeft size={14} />
            <span>Collapse</span>
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                active
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
  </>
  );

 return (
 <>
 {mobileOpen && (
 <div className="fixed inset-0 z-40 md:hidden" onClick={onMobileClose}>
 <div className="absolute inset-0 bg-black/50" />
 </div>
 )}
      <aside className={`fixed md:hidden z-50 inset-y-0 left-0 bg-white border-r border-gray-200 text-gray-800 flex flex-col transition-all duration-200 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
      <aside className={`hidden md:flex ${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-200 text-gray-800 flex-col transition-all duration-200 ease-in-out shrink-0`}>
 {sidebarContent}
 </aside>
 </>
 );
}
