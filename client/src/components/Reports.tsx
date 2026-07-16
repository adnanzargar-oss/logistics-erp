import { useEffect, useState, useMemo, useRef } from 'react';
import {
  BarChart3, TrendingUp, IndianRupee, Truck, Package, Receipt, Building2,
  Calendar, Download, ChevronDown, BookOpen, Wallet, Fuel, Wrench,
  ArrowUpRight, ArrowDownRight, Users, Clock, FileText, ArrowDownToLine, PackageCheck,
  Search, X
} from 'lucide-react';
import { api } from '../api';

type DatePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisYear', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
];

type ReportType = 'bookings' | 'financial' | 'customers' | 'fleet' | 'operations' | 'expenses';

const REPORT_TYPES: { key: ReportType; label: string; desc: string; icon: any }[] = [
  { key: 'bookings', label: 'Booking Summary', desc: 'Volume, status trends & route analysis', icon: BookOpen },
  { key: 'financial', label: 'Financial Report', desc: 'Revenue, collections & outstanding', icon: IndianRupee },
  { key: 'customers', label: 'Customer Analytics', desc: 'Top customers & booking patterns', icon: Building2 },
  { key: 'fleet', label: 'Fleet Performance', desc: 'Utilization, fuel & maintenance', icon: Truck },
  { key: 'operations', label: 'Operations Overview', desc: 'Loadings, receivings & deliveries', icon: Package },
  { key: 'expenses', label: 'Expense Breakdown', desc: 'By category, vehicle & monthly trend', icon: Receipt },
];

function toISO(d: Date): string { return d.toISOString().split('T')[0]; }

function getDateRange(preset: DatePreset, customFrom?: string, customTo?: string): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case 'today': return { from: toISO(now), to: toISO(now) };
    case 'yesterday': { const d = new Date(now); d.setDate(d.getDate() - 1); return { from: toISO(d), to: toISO(d) }; }
    case 'last7': { const d = new Date(now); d.setDate(d.getDate() - 6); return { from: toISO(d), to: toISO(now) }; }
    case 'last30': { const d = new Date(now); d.setDate(d.getDate() - 29); return { from: toISO(d), to: toISO(now) }; }
    case 'thisMonth': return { from: toISO(new Date(y, m, 1)), to: toISO(now) };
    case 'lastMonth': return { from: toISO(new Date(y, m - 1, 1)), to: toISO(new Date(y, m, 0)) };
    case 'thisYear': return { from: toISO(new Date(y, 0, 1)), to: toISO(now) };
    case 'custom': return { from: customFrom || toISO(now), to: customTo || toISO(now) };
  }
}

function fmt(n: number | string): string {
  if (typeof n === 'string') return n;
  return n.toLocaleString('en-IN');
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Booking { id: number; booking_no: string; lr_date?: string; created_at: string; from_location?: string; to_location?: string; consignor_name?: string; consignee_name?: string; num_bags?: number; actual_weight?: number; charged_weight?: number; freight?: number; grand_total?: number; status: string; loaded: number; delivered: number; received: number; paid: number; }

export default function Reports() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [reportType, setReportType] = useState<ReportType>('bookings');
  const [presetOpen, setPresetOpen] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [allFuel, setAllFuel] = useState<any[]>([]);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [allLoadings, setAllLoadings] = useState<any[]>([]);
  const [allReceivings, setAllReceivings] = useState<any[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.bookings.list().catch(() => []),
      api.invoices.list().catch(() => []),
      api.payments.list().catch(() => []),
      api.customers.list().catch(() => []),
      api.vehicles.list().catch(() => []),
      api.drivers.list().catch(() => []),
      api.fuel.list().catch(() => []),
      api.expenses.list().catch(() => []),
      api.loadings.list().catch(() => []),
      api.receivings.list().catch(() => []),
      api.deliveries.list().catch(() => []),
    ]).then(([b, inv, pay, cust, veh, drv, fuel, exp, ld, rc, dl]) => {
      setAllBookings(b as Booking[]);
      setAllInvoices(inv);
      setAllPayments(pay);
      setAllCustomers(cust);
      setAllVehicles(veh);
      setAllDrivers(drv);
      setAllFuel(fuel);
      setAllExpenses(exp);
      setAllLoadings(ld);
      setAllReceivings(rc);
      setAllDeliveries(dl);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) setPresetOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dr = getDateRange(datePreset, customFrom, customTo);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const d = b.lr_date || b.created_at?.split(' ')[0] || '';
      return d >= dr.from && d <= dr.to;
    });
  }, [allBookings, dr]);

  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((i) => {
      const d = i.invoice_date || '';
      return d >= dr.from && d <= dr.to;
    });
  }, [allInvoices, dr]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      const d = p.payment_date || '';
      return d >= dr.from && d <= dr.to;
    });
  }, [allPayments, dr]);

  const filteredFuel = useMemo(() => {
    return allFuel.filter((f) => {
      const d = f.fuel_date || '';
      return d >= dr.from && d <= dr.to;
    });
  }, [allFuel, dr]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      const d = e.expense_date || '';
      return d >= dr.from && d <= dr.to;
    });
  }, [allExpenses, dr]);

  const filteredLoadings = useMemo(() => {
    return allLoadings.filter((l) => {
      const d = l.loading_date || '';
      return d >= dr.from && d <= dr.to;
    });
  }, [allLoadings, dr]);

  const filteredReceivings = useMemo(() => {
    return allReceivings.filter((r) => {
      const d = r.receiving_date || '';
      return d >= dr.from && d <= dr.to;
    });
  }, [allReceivings, dr]);

  const filteredDeliveries = useMemo(() => {
    return allDeliveries.filter((d) => {
      const dd = d.delivery_date || '';
      return dd >= dr.from && dd <= dr.to;
    });
  }, [allDeliveries, dr]);

  const selectedPresetLabel = PRESETS.find((p) => p.key === datePreset)?.label || 'Custom';

  /* ── Bookings Report ── */
  const bookingStats = useMemo(() => {
    const statusBreakdown: Record<string, number> = {};
    let totalFreight = 0;
    let totalGrand = 0;
    let totalBags = 0;
    const routeCount: Record<string, number> = {};
    for (const b of filteredBookings) {
      statusBreakdown[b.status] = (statusBreakdown[b.status] || 0) + 1;
      totalFreight += b.freight || 0;
      totalGrand += b.grand_total || 0;
      totalBags += b.num_bags || 0;
      const route = `${b.from_location || '?'} → ${b.to_location || '?'}`;
      routeCount[route] = (routeCount[route] || 0) + 1;
    }
    const sortedRoutes = Object.entries(routeCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxRoute = Math.max(...sortedRoutes.map((r) => r[1]), 1);
    return { statusBreakdown, totalFreight, totalGrand, totalBags, routes: sortedRoutes, total: filteredBookings.length, maxRoute };
  }, [filteredBookings]);

  /* Monthly trend for bookings */
  const bookingMonthlyTrend = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    for (const b of filteredBookings) {
      const d = b.lr_date || b.created_at?.split(' ')[0] || '';
      const m = d.slice(0, 7);
      if (!map[m]) map[m] = { count: 0, revenue: 0 };
      map[m].count++;
      map[m].revenue += b.grand_total || 0;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredBookings]);

  const maxMonthCount = Math.max(...bookingMonthlyTrend.map(([, v]) => v.count), 1);

  /* ── Financial Report ── */
  const financialStats = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    for (const inv of filteredInvoices) {
      totalInvoiced += inv.total_amount || 0;
      totalPaid += inv.paid_amount || 0;
      totalOutstanding += (inv.total_amount || 0) - (inv.paid_amount || 0);
    }
    const statusCount: Record<string, number> = {};
    for (const inv of filteredInvoices) {
      statusCount[inv.status] = (statusCount[inv.status] || 0) + 1;
    }
    const paymentMethod: Record<string, number> = {};
    let totalPayments = 0;
    for (const p of filteredPayments) {
      totalPayments += p.amount || 0;
      paymentMethod[p.payment_mode] = (paymentMethod[p.payment_mode] || 0) + (p.amount || 0);
    }
    return { totalInvoiced, totalPaid, totalOutstanding, statusCount, paymentMethod, totalPayments, invoiceCount: filteredInvoices.length };
  }, [filteredInvoices, filteredPayments]);

  const collectionRate = financialStats.totalInvoiced > 0 ? (financialStats.totalPaid / financialStats.totalInvoiced * 100) : 0;

  /* ── Customer Report ── */
  const customerStats = useMemo(() => {
    const custMap: Record<number, { name: string; bookings: number; revenue: number }> = {};
    for (const b of filteredBookings) {
      const key = b.consignor_name || 'Unknown';
      if (!custMap[key]) custMap[key] = { name: key, bookings: 0, revenue: 0 };
      custMap[key].bookings++;
      custMap[key].revenue += b.grand_total || 0;
    }
    const topByBookings = Object.values(custMap).sort((a, b) => b.bookings - a.bookings).slice(0, 10);
    const topByRevenue = Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const maxRev = Math.max(...topByRevenue.map((c) => c.revenue), 1);
    return { topByBookings, topByRevenue, totalCustomers: Object.keys(custMap).length, maxRev };
  }, [filteredBookings]);

  /* ── Fleet Report ── */
  const fleetStats = useMemo(() => {
    const activeVehicles = allVehicles.filter((v) => v.status === 'Active').length;
    let totalFuelLtr = 0;
    let totalFuelCost = 0;
    for (const f of filteredFuel) { totalFuelLtr += f.quantity_ltr || 0; totalFuelCost += f.total_cost || 0; }
    const fuelByVehicle: Record<string, { reg: string; ltr: number; cost: number }> = {};
    for (const f of filteredFuel) {
      const v = allVehicles.find((v) => v.id === f.vehicle_id);
      const key = v?.reg_number || `#${f.vehicle_id}`;
      if (!fuelByVehicle[key]) fuelByVehicle[key] = { reg: key, ltr: 0, cost: 0 };
      fuelByVehicle[key].ltr += f.quantity_ltr || 0;
      fuelByVehicle[key].cost += f.total_cost || 0;
    }
    const fuelChart = Object.values(fuelByVehicle).sort((a, b) => b.cost - a.cost);
    const maxFuel = Math.max(...fuelChart.map((f) => f.cost), 1);
    const activeDrivers = allDrivers.filter((d) => d.status === 'Active').length;
    return { activeVehicles, activeDrivers, totalFuelLtr, totalFuelCost, fuelChart, maxFuel, totalVehicles: allVehicles.length, totalDrivers: allDrivers.length };
  }, [allVehicles, allDrivers, filteredFuel]);

  /* ── Operations Report ── */
  const opsStats = useMemo(() => {
    const monthly: Record<string, { loading: number; receiving: number; delivery: number }> = {};
    for (const l of filteredLoadings) {
      const m = (l.loading_date || '').slice(0, 7);
      if (!m) continue;
      if (!monthly[m]) monthly[m] = { loading: 0, receiving: 0, delivery: 0 };
      monthly[m].loading++;
    }
    for (const r of filteredReceivings) {
      const m = (r.receiving_date || '').slice(0, 7);
      if (!m) continue;
      if (!monthly[m]) monthly[m] = { loading: 0, receiving: 0, delivery: 0 };
      monthly[m].receiving++;
    }
    for (const d of filteredDeliveries) {
      const m = (d.delivery_date || '').slice(0, 7);
      if (!m) continue;
      if (!monthly[m]) monthly[m] = { loading: 0, receiving: 0, delivery: 0 };
      monthly[m].delivery++;
    }
    const sorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
    const maxOp = Math.max(...sorted.map(([, v]) => Math.max(v.loading, v.receiving, v.delivery)), 1);
    return { monthly: sorted, totalLoadings: filteredLoadings.length, totalReceivings: filteredReceivings.length, totalDeliveries: filteredDeliveries.length, maxOp };
  }, [filteredLoadings, filteredReceivings, filteredDeliveries]);

  /* ── Expense Report ── */
  const expenseStats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    let total = 0;
    for (const e of filteredExpenses) {
      const cat = e.expense_category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + (e.total_amount || e.amount || 0);
      total += e.total_amount || e.amount || 0;
    }
    const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const maxCat = Math.max(...sortedCats.map(([, v]) => v), 1);
    const monthly: Record<string, number> = {};
    for (const e of filteredExpenses) {
      const m = (e.expense_date || '').slice(0, 7);
      if (!m) continue;
      monthly[m] = (monthly[m] || 0) + (e.total_amount || e.amount || 0);
    }
    const monthlySorted = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
    const maxMonthly = Math.max(...monthlySorted.map(([, v]) => v), 1);
    return { byCategory: sortedCats, total, maxCat, monthly: monthlySorted, maxMonthly, count: filteredExpenses.length };
  }, [filteredExpenses]);

  /* ── Export CSV ── */
  const exportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    switch (reportType) {
      case 'bookings':
        headers = ['Booking #', 'Date', 'From', 'To', 'Consignor', 'Consignee', 'Bags', 'Freight', 'Grand Total', 'Status'];
        rows = filteredBookings.map((b) => [b.booking_no, b.lr_date || '', b.from_location || '', b.to_location || '', b.consignor_name || '', b.consignee_name || '', String(b.num_bags || ''), String(b.freight || ''), String(b.grand_total || ''), b.status]);
        break;
      case 'financial':
        headers = ['Invoice #', 'Date', 'Total', 'Paid', 'Outstanding', 'Status'];
        rows = filteredInvoices.map((i) => [i.invoice_no, i.invoice_date, String(i.total_amount || 0), String(i.paid_amount || 0), String((i.total_amount || 0) - (i.paid_amount || 0)), i.status]);
        break;
      case 'customers':
        headers = ['Customer', 'Bookings', 'Revenue'];
        rows = customerStats.topByRevenue.map((c) => [c.name, String(c.bookings), String(c.revenue)]);
        break;
      case 'fleet':
        headers = ['Vehicle', 'Fuel Liters', 'Fuel Cost'];
        rows = fleetStats.fuelChart.map((f) => [f.reg, String(f.ltr.toFixed(1)), String(f.cost)]);
        break;
      case 'operations':
        headers = ['Month', 'Loadings', 'Receivings', 'Deliveries'];
        rows = opsStats.monthly.map(([m, v]) => [m, String(v.loading), String(v.receiving), String(v.delivery)]);
        break;
      case 'expenses':
        headers = ['Category', 'Amount'];
        rows = expenseStats.byCategory.map(([c, v]) => [c, String(v)]);
        break;
    }
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => c.includes(',') ? `"${c}"` : c).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

  const Bar = ({ h, max, label, color }: { h: number; max: number; label: string; color?: string }) => {
    const pct = max > 0 ? (h / max) * 100 : 0;
    return (
      <div className="flex-1 flex flex-col items-center gap-1 group">
        <span className="text-[10px] font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{h}</span>
        <div className="w-full bg-gray-50 rounded-t-md relative overflow-hidden" style={{ height: '120px' }}>
          <div className={`absolute bottom-0 w-full rounded-t-md transition-all group-hover:brightness-110 ${color || 'bg-gradient-to-t from-indigo-500 to-indigo-400'}`} style={{ height: `${Math.max(pct, 4)}%` }} />
        </div>
        <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-sm font-medium">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Calendar size={15} className="text-gray-400 shrink-0" />
          <div ref={presetRef} className="relative">
            <button onClick={() => setPresetOpen(!presetOpen)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 whitespace-nowrap">
              {selectedPresetLabel} <ChevronDown size={13} />
            </button>
            {presetOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-44 py-1">
                {PRESETS.map((p) => (
                  <button key={p.key} onClick={() => { setDatePreset(p.key); setPresetOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${datePreset === p.key ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}>{p.label}</button>
                ))}
              </div>
            )}
          </div>
          {datePreset === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border rounded px-2 py-1 text-sm outline-none w-32 sm:w-auto" />
              <span className="text-gray-400 text-xs">to</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border rounded px-2 py-1 text-sm outline-none w-32 sm:w-auto" />
            </div>
          )}
          <span className="text-xs text-gray-400 hidden sm:inline">{dr.from} – {dr.to}</span>
        </div>
      </div>

      {/* Report Type Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const active = reportType === rt.key;
          return (
            <button key={rt.key} onClick={() => setReportType(rt.key)}
              className={`text-left p-3 rounded-xl border transition-all ${active ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:shadow'}`}>
              <div className={`p-1.5 w-fit rounded-lg mb-2 ${active ? 'bg-indigo-100' : 'bg-gray-50'}`}>
                <Icon size={16} className={active ? 'text-indigo-600' : 'text-gray-500'} />
              </div>
              <p className={`text-xs font-semibold ${active ? 'text-indigo-700' : 'text-gray-700'}`}>{rt.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{rt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {reportType === 'bookings' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Bookings</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{bookingStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Freight</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(bookingStats.totalFreight)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Grand Total</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(bookingStats.totalGrand)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Bags</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(bookingStats.totalBags)}</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Status Breakdown</h3>
              {Object.keys(bookingStats.statusBreakdown).length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No data</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(bookingStats.statusBreakdown).map(([status, count]) => {
                    const pct = bookingStats.total > 0 ? (count / bookingStats.total) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{status}</span>
                          <span className="font-medium text-gray-800">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Monthly Trend</h3>
              {bookingMonthlyTrend.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No data</p>
              ) : (
                <div className="overflow-x-auto pb-1">
                <div className="flex items-end gap-1.5 min-w-[200px]" style={{ height: '120px' }}>
                  {bookingMonthlyTrend.map(([m, v]) => {
                    const pct = (v.count / maxMonthCount) * 100;
                    const label = MONTHS_SHORT[parseInt(m.split('-')[1]) - 1] || m;
                    return <Bar key={m} h={v.count} max={maxMonthCount} label={label} />;
                  })}
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Top Routes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Top Routes</h3>
            {bookingStats.routes.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No data</p>
            ) : (
              <div className="space-y-2">
                {bookingStats.routes.map(([route, count]) => {
                  const pct = (count / bookingStats.maxRoute) * 100;
                  return (
                    <div key={route} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 truncate flex-1 min-w-0">{route}</span>
                      <div className="flex-1 h-4 bg-gray-50 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700 text-sm">Booking Details</h3>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider sticky top-0">
                  <tr><th className="text-left py-2 px-3">#</th><th className="text-left py-2 px-3">Date</th><th className="text-left py-2 px-3">Route</th><th className="text-left py-2 px-3">Consignor</th><th className="text-left py-2 px-3">Consignee</th><th className="text-right py-2 px-3">Amount</th><th className="text-left py-2 px-3">Status</th></tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.slice(0, 50).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-1.5 px-3 font-mono font-medium">{b.booking_no}</td>
                      <td className="py-1.5 px-3 text-gray-500">{b.lr_date || '-'}</td>
                      <td className="py-1.5 px-3 text-gray-500">{b.from_location || '?'} → {b.to_location || '?'}</td>
                      <td className="py-1.5 px-3 text-gray-600 truncate max-w-[100px] sm:max-w-[140px]">{b.consignor_name || '-'}</td>
                      <td className="py-1.5 px-3 text-gray-600 truncate max-w-[100px] sm:max-w-[140px] hidden sm:table-cell">{b.consignee_name || '-'}</td>
                      <td className="py-1.5 px-3 text-right font-medium">{b.grand_total?.toLocaleString() || '-'}</td>
                      <td className="py-1.5 px-3"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${b.status === 'Completed' ? 'text-green-600 bg-green-50 border-green-200' : b.status === 'In Progress' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No bookings in this period</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'financial' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Invoiced</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(financialStats.totalInvoiced)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Collected</p>
              <p className="text-xl font-bold text-green-700 mt-1">{fmt(financialStats.totalPaid)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Outstanding</p>
              <p className="text-xl font-bold text-red-600 mt-1">{fmt(financialStats.totalOutstanding)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Collection Rate</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{collectionRate.toFixed(0)}%</p>
            </div>
          </div>

          {/* Collection progress */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Collection Progress</span>
              <span className="text-gray-500">{fmt(financialStats.totalPaid)} / {fmt(financialStats.totalInvoiced)}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all" style={{ width: `${collectionRate}%` }} />
            </div>
          </div>

          {/* Invoice Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Invoice Status</h3>
              {Object.keys(financialStats.statusCount).length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No invoices</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(financialStats.statusCount).map(([s, c]) => {
                    const pct = financialStats.invoiceCount > 0 ? (c / financialStats.invoiceCount) * 100 : 0;
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{s}</span><span className="font-medium">{c}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s === 'Paid' ? 'bg-green-500' : s === 'Unpaid' ? 'bg-red-400' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Payment Methods</h3>
              {Object.keys(financialStats.paymentMethod).length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No payments</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(financialStats.paymentMethod).map(([m, amt]) => {
                    const pct = financialStats.totalPayments > 0 ? (amt / financialStats.totalPayments) * 100 : 0;
                    return (
                      <div key={m}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{m}</span><span className="font-medium">{fmt(amt)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'customers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Active Customers</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{customerStats.totalCustomers}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Bookings</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{bookingStats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Avg per Customer</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{customerStats.totalCustomers > 0 ? (bookingStats.total / customerStats.totalCustomers).toFixed(1) : '0'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Top Customers by Revenue</h3>
              {customerStats.topByRevenue.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No data</p>
              ) : (
                <div className="space-y-2">
                  {customerStats.topByRevenue.map((c, i) => {
                    const pct = (c.revenue / customerStats.maxRev) * 100;
                    return (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}</span>
                        <span className="text-xs text-gray-600 truncate min-w-0 flex-1">{c.name}</span>
                        <div className="hidden sm:block flex-1 h-4 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-20 text-right shrink-0">{fmt(c.revenue)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Top Customers by Volume</h3>
              {customerStats.topByBookings.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No data</p>
              ) : (
                <div className="space-y-2">
                  {customerStats.topByBookings.map((c, i) => {
                    const pct = customerStats.topByBookings.length > 0 ? (c.bookings / customerStats.topByBookings[0].bookings) * 100 : 0;
                    return (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}</span>
                        <span className="text-xs text-gray-600 truncate min-w-0 flex-1">{c.name}</span>
                        <div className="hidden sm:block flex-1 h-4 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8 text-right shrink-0">{c.bookings}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reportType === 'fleet' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Vehicles</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fleetStats.activeVehicles}/{fleetStats.totalVehicles}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Drivers</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fleetStats.activeDrivers}/{fleetStats.totalDrivers}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Fuel (L)</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fleetStats.totalFuelLtr.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Fuel Cost</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(fleetStats.totalFuelCost)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Fuel Consumption by Vehicle</h3>
            {fleetStats.fuelChart.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No fuel entries</p>
            ) : (
              <div className="space-y-2">
                {fleetStats.fuelChart.map((v) => {
                  const pct = (v.cost / fleetStats.maxFuel) * 100;
                  return (
                    <div key={v.reg} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 truncate min-w-0 flex-1 max-w-[100px] sm:max-w-none">{v.reg}</span>
                      <div className="hidden sm:block flex-1 h-4 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-14 text-right shrink-0">{v.ltr.toFixed(0)}L</span>
                      <span className="text-xs font-medium text-gray-700 w-20 text-right shrink-0">{fmt(v.cost)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {reportType === 'operations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Loadings</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{opsStats.totalLoadings}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Receivings</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{opsStats.totalReceivings}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Deliveries</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{opsStats.totalDeliveries}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">Monthly Operations Trend</h3>
            {opsStats.monthly.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No data</p>
            ) : (
              <div className="space-y-3">
              <div className="overflow-x-auto pb-1">
                <div className="flex items-end gap-1.5 min-w-[300px]" style={{ height: '100px' }}>
                  {opsStats.monthly.map(([m, v]) => {
                    const total = v.loading + v.receiving + v.delivery;
                    const maxTotal = Math.max(...opsStats.monthly.map(([, x]) => x.loading + x.receiving + x.delivery), 1);
                    const barH = (total / maxTotal) * 100;
                    const lH = total > 0 ? (v.loading / total) * 100 : 0;
                    const rH = total > 0 ? (v.receiving / total) * 100 : 0;
                    const dH = total > 0 ? (v.delivery / total) * 100 : 0;
                    const label = MONTHS_SHORT[parseInt(m.split('-')[1]) - 1] || m;
                    return (
                      <div key={m} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                        <div className="w-full rounded-t-md overflow-hidden" style={{ height: `${Math.max(barH, 4)}%`, alignSelf: 'flex-end' }}>
                          <div className="h-full w-full flex flex-col-reverse">
                            {dH > 0 && <div className="w-full bg-orange-400 transition-all" style={{ height: `${dH}%` }} title={`Deliveries: ${v.delivery}`} />}
                            {rH > 0 && <div className="w-full bg-blue-400 transition-all" style={{ height: `${rH}%` }} title={`Receivings: ${v.receiving}`} />}
                            {lH > 0 && <div className="w-full bg-green-400 transition-all" style={{ height: `${lH}%` }} title={`Loadings: ${v.loading}`} />}
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-400">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-center gap-4 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400" /> Loadings</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400" /> Receivings</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-400" /> Deliveries</span>
              </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700 text-sm">Detailed Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                  <tr><th className="text-left py-2 px-3">Month</th><th className="text-right py-2 px-3">Loadings</th><th className="text-right py-2 px-3">Receivings</th><th className="text-right py-2 px-3">Deliveries</th><th className="text-right py-2 px-3">Total</th></tr>
                </thead>
                <tbody className="divide-y">
                  {opsStats.monthly.map(([m, v]) => (
                    <tr key={m} className="hover:bg-gray-50">
                      <td className="py-1.5 px-3 font-medium">{m}</td>
                      <td className="py-1.5 px-3 text-right">{v.loading}</td>
                      <td className="py-1.5 px-3 text-right">{v.receiving}</td>
                      <td className="py-1.5 px-3 text-right">{v.delivery}</td>
                      <td className="py-1.5 px-3 text-right font-medium">{v.loading + v.receiving + v.delivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'expenses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{fmt(expenseStats.total)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Categories</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{expenseStats.byCategory.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[11px] text-gray-500 font-medium">Entries</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{expenseStats.count}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">By Category</h3>
              {expenseStats.byCategory.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No expenses</p>
              ) : (
                <div className="space-y-2">
                  {expenseStats.byCategory.map(([cat, amt]) => {
                    const pct = (amt / expenseStats.maxCat) * 100;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{cat}</span>
                          <span className="font-medium text-gray-800">{fmt(amt)}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Monthly Trend</h3>
              {expenseStats.monthly.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No data</p>
              ) : (
                <div className="overflow-x-auto pb-1">
                <div className="flex items-end gap-1.5 min-w-[200px]" style={{ height: '120px' }}>
                  {expenseStats.monthly.map(([m, amt]) => {
                    const pct = (amt / expenseStats.maxMonthly) * 100;
                    const label = MONTHS_SHORT[parseInt(m.split('-')[1]) - 1] || m;
                    return <Bar key={m} h={amt} max={expenseStats.maxMonthly} label={label} color="bg-gradient-to-t from-orange-500 to-orange-400" />;
                  })}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
