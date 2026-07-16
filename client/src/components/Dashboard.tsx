import { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { DashboardData } from '../types';
import { Search, X, TrendingUp, Package, Truck, Users, IndianRupee, Building2, ArrowUpRight, ArrowDownRight, Clock, FileText, ArrowDownToLine, PackageCheck, Activity, Receipt } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';

interface SearchResult {
  id: number;
  code: string;
  type: 'LRR' | 'Load' | 'Delivery';
  consignor_name?: string;
  consignee_name?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: 'text-green-600 bg-green-50 border-green-200 ',
  'In Progress': 'text-amber-600 bg-amber-50 border-amber-200 ',
  Booked: 'text-blue-600 bg-blue-50 border-blue-200 ',
  Unloaded: 'text-purple-600 bg-purple-50 border-purple-200 ',
};

const MetricCard = ({ icon: Icon, iconBg, iconColor, label, value, sub, onClick, children }: any) => (
  <div onClick={onClick} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between">
  <div>
  <div className="flex items-center justify-between mb-2">
  <div className={`p-2 rounded-lg ${iconBg} group-hover:brightness-95 transition-all`}>
  <Icon size={16} className={iconColor} />
  </div>
  </div>
  <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
  {sub && <div className="mt-2 text-[11px] text-gray-400">{sub}</div>}
  {children}
  </div>
);

function BarChartCard({ data: chartData }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...chartData.map((m) => m.count), 1);
  if (chartData.length === 0) return <p className="text-gray-400 text-sm py-12 text-center">No data</p>;
  return (
  <div className="flex items-end gap-1.5 h-28 sm:h-32">
  {chartData.map((m) => (
  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
  <span className="text-[9px] font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</span>
  <div className="w-full bg-indigo-50 rounded-t-md relative overflow-hidden" style={{ height: `${Math.max((m.count / max) * 100, 6)}%` }}>
  <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md transition-all group-hover:brightness-110" style={{ height: `${(m.count / max) * 100}%` }} />
  </div>
  <span className="text-[9px] text-gray-400 font-medium">{new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' })}</span>
  </div>
  ))}
  </div>
  );
}

function LineChartCard({ data: dashboardData }: { data: DashboardData }) {
  const allMonths = [...new Set([
  ...dashboardData.monthlyBookings.map((m: any) => m.month),
  ...dashboardData.monthlyLoadings.map((m: any) => m.month),
  ...dashboardData.monthlyReceivings.map((m: any) => m.month),
  ...dashboardData.monthlyDeliveries.map((m: any) => m.month),
  ])].sort();
  if (allMonths.length === 0) return <p className="text-gray-400 text-sm py-12 text-center">No data</p>;

  const series = [
  { key: 'monthlyBookings', label: 'Bookings', color: '#6366f1' },
  { key: 'monthlyLoadings', label: 'Loadings', color: '#10b981' },
  { key: 'monthlyReceivings', label: 'Receivings', color: '#f59e0b' },
  { key: 'monthlyDeliveries', label: 'Deliveries', color: '#ef4444' },
  ];
  const getCount = (month: string, arr: any[]) => { const f = arr.find((m: any) => m.month === month); return f ? f.count : 0; };
  const allValues = allMonths.flatMap((m) => series.map((s) => getCount(m, (dashboardData as any)[s.key])));
  const maxVal = Math.max(...allValues, 1);
  const w = 600, h = 180, pad = { top: 8, right: 16, bottom: 26, left: 32 };
  const chartW = w - pad.left - pad.right, chartH = h - pad.top - pad.bottom;
  const xStep = chartW / (allMonths.length - 1 || 1);
  const toX = (i: number) => pad.left + i * xStep;
  const toY = (v: number) => pad.top + chartH - (v / maxVal) * chartH;
  const linePath = (arr: any[]) => arr.map((m: any, i: number) => `${i === 0 ? 'M' : 'L'}${toX(allMonths.indexOf(m.month))},${toY(m.count)}`).join(' ');

  return (
  <div className="overflow-x-auto pb-1 -mx-1">
  <svg viewBox={`0 0 ${w} ${h + 16}`} className="w-full min-w-[400px]" style={{ maxWidth: '100%' }}>
  {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
  const y = pad.top + chartH - pct * chartH;
  return (
  <g key={pct}>
  <line x1={pad.left} x2={w - pad.right} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
  <text x={pad.left - 4} y={y + 3} textAnchor="end" className="text-[9px]" fill="#94a3b8">{Math.round(maxVal * pct)}</text>
  </g>
  );
  })}
  {allMonths.map((m, i) => (
  <text key={m} x={toX(i)} y={h - pad.bottom + 16} textAnchor="middle" className="text-[9px]" fill="#94a3b8">
  {new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
  </text>
  ))}
  {series.map((s) => {
  const arr = (dashboardData as any)[s.key];
  if (arr.length === 0) return null;
  return <path key={s.key} d={linePath(arr)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />;
  })}
  {series.map((s) => {
  const arr = (dashboardData as any)[s.key];
  if (arr.length === 0) return null;
  return arr.map((m: any) => <circle key={`${s.key}-${m.month}`} cx={toX(allMonths.indexOf(m.month))} cy={toY(m.count)} r="3" fill={s.color} stroke="#fff" strokeWidth="1.5" />);
  })}
  </svg>
  <div className="flex flex-wrap justify-center gap-3 mt-1.5 text-[10px]">
  {series.map((s) => (
  <span key={s.key} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}</span>
  ))}
  </div>
  </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const onNavigate = useNavigate();

  useEffect(() => {
  Promise.all([
  api.dashboard.get(),
  fetch('/api/dashboard/activity').then((r) => r.json()),
  ]).then(([d, a]) => { setData(d); setActivity(a); }).catch(console.error);
  }, []);

  useEffect(() => {
  const handleClick = (e: MouseEvent) => {
  if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
  setShowResults(false);
  }
  };
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = async (q: string) => {
  setSearchQuery(q);
  if (!q.trim()) { setSearchResults([]); setShowResults(false); return; }
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const d = await res.json();
  setSearchResults(d);
  setShowResults(true);
  };

  const resultPage = (r: SearchResult) => {
  const pages: Record<string, string> = { LRR: 'bookings', Load: 'loadings', Delivery: 'deliveries' };
  return pages[r.type] || 'bookings';
  };

  if (!data) return (
  <div className="flex items-center justify-center h-[60vh]">
  <div className="flex items-center gap-3 text-gray-400 ">
  <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
  <span className="text-sm">Loading dashboard...</span>
  </div>
  </div>
  );

  return (
  <div className="space-y-4 relative">
  <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0">
  <svg viewBox="0 0 468.62 308.07" className="w-[300px] h-auto opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
  <path fill="#ef453c" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69Z"/>
  <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
  </svg>
  </div>
  <div className="relative z-10">

  {/* ── Header ── */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div>
  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
  <p className="text-sm text-gray-500 mt-0.5">Planet Transport operations overview</p>
  </div>
  <div ref={searchRef} className="relative w-full sm:w-72">
  <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
  <Search size={16} className="text-gray-400 mr-2 shrink-0" />
  <input value={searchQuery} onChange={(e) => doSearch(e.target.value)} placeholder="Search LRR, consignor, load..." className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400" />
  {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }} className="p-0.5 hover:bg-gray-100 rounded"><X size={14} className="text-gray-400" /></button>}
  </div>
  {showResults && (
  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
  {searchResults.length === 0 ? <p className="text-sm text-gray-400 p-4 text-center">No results found</p> : searchResults.map((r, i) => (
  <div key={`${r.type}-${r.id}-${i}`} onClick={() => { setShowResults(false); onNavigate(resultPage(r), r.id); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100">
  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${r.type === 'LRR' ? 'text-indigo-600 bg-indigo-50' : r.type === 'Load' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>{r.type}</span>
  <span className="font-mono text-sm font-medium text-gray-800">{r.code}</span>
  {r.consignor_name && <span className="text-xs text-gray-400 truncate">{r.consignor_name}</span>}
  {r.consignee_name && <span className="text-xs text-gray-400 truncate">→ {r.consignee_name}</span>}
  </div>
  ))}
  </div>
  )}
  </div>
  </div>

  {/* ── Main + Activity Sidebar ── */}
  <div className="flex flex-col lg:flex-row gap-4">

  {/* ── Bento Grid (left) ── */}
  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-min">

  {/* Bookings — tall card */}
  <div className="col-span-2 sm:col-span-1 sm:row-span-2 bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between" onClick={() => onNavigate('bookings')}>
  <div>
  <div className="flex items-center justify-between mb-3">
  <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors"><Package size={18} className="text-indigo-600" /></div>
  <span className="text-[11px] text-gray-400">{data.bookings.total_bookings} total</span>
  </div>
  <p className="text-2xl font-bold text-gray-900">{data.bookings.total_bookings}</p>
  <p className="text-xs text-gray-500 mt-0.5">Total Bookings</p>
  </div>
  <div className="mt-3 pt-3 border-t border-gray-50">
  <div className="grid grid-cols-2 gap-2 text-[11px]">
  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-gray-500">Completed</span><span className="ml-auto font-medium text-gray-800">{data.bookings.completed}</span></div>
  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-gray-500">Active</span><span className="ml-auto font-medium text-gray-800">{data.bookings.in_progress}</span></div>
  </div>
  </div>
  </div>

  {/* Vehicles */}
  <MetricCard icon={Truck} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Active Vehicles" value={data.vehicles.active} sub={<span className="flex items-center gap-1"><Users size={11} />{data.drivers.active} drivers · {data.vehicles.total} total</span>} onClick={() => onNavigate('fleet')} />

  {/* Customers */}
  <MetricCard icon={Building2} iconBg="bg-violet-50" iconColor="text-violet-600" label="Customers" value={data.customerCount} onClick={() => onNavigate('customers')} />

  {/* Outstanding — spans 2 cols on mobile, spans row 2 on desktop */}
  <div className="col-span-2 sm:col-span-1 sm:row-span-2 bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex flex-col justify-between" onClick={() => onNavigate('invoices')}>
  <div>
  <div className="flex items-center justify-between mb-3">
  <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors"><IndianRupee size={18} className="text-amber-600" /></div>
  <span className="text-[11px] text-gray-400">{data.invoices.total} invoices</span>
  </div>
  <p className="text-2xl font-bold text-gray-900">{data.invoices.outstanding.toLocaleString()}</p>
  <p className="text-xs text-gray-500 mt-0.5">Outstanding</p>
  </div>
  <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-500">Collected</span><span className="font-medium text-green-700">{data.invoices.paid_amount.toLocaleString()}</span></div>
  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${data.invoices.total_amount > 0 ? (data.invoices.paid_amount / data.invoices.total_amount) * 100 : 0}%` }} />
  </div>
  <div className="flex items-center justify-between text-[11px]"><span className="text-gray-400">Collection</span><span className="font-medium text-gray-700">{data.invoices.total_amount > 0 ? ((data.invoices.paid_amount / data.invoices.total_amount) * 100).toFixed(0) : 0}%</span></div>
  </div>
  </div>

  {/* Monthly Bookings Bar Chart — spans 3 cols */}
  <div className="col-span-2 sm:col-span-3 bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between mb-3">
  <div><h3 className="font-semibold text-gray-900 text-sm">Monthly Bookings</h3><p className="text-[10px] text-gray-400 mt-0.5">Last 6 months</p></div>
  <div className="p-1.5 bg-indigo-50 rounded-lg"><TrendingUp size={14} className="text-indigo-500" /></div>
  </div>
  <BarChartCard data={data.monthlyBookings} />
  </div>

  {/* Today's Movement — spans 1 col */}
  <div className="col-span-2 sm:col-span-1 bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
  <h3 className="font-semibold text-gray-700 text-xs mb-3">Today's Movement</h3>
  <div className="space-y-3">
  <div onClick={() => onNavigate('loadings')} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
  <div className="flex items-center gap-2"><PackageCheck size={15} className="text-green-600" /><span className="text-xs text-gray-600">Loadings</span></div>
  <span className="font-bold text-gray-900">{data.todayOps?.loadings || 0}</span>
  </div>
  <div onClick={() => onNavigate('receivings')} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
  <div className="flex items-center gap-2"><ArrowDownToLine size={15} className="text-blue-600" /><span className="text-xs text-gray-600">Receivings</span></div>
  <span className="font-bold text-gray-900">{data.todayOps?.receivings || 0}</span>
  </div>
  <div onClick={() => onNavigate('deliveries')} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
  <div className="flex items-center gap-2"><Package size={15} className="text-orange-600" /><span className="text-xs text-gray-600">Deliveries</span></div>
  <span className="font-bold text-gray-900">{data.todayOps?.deliveries || 0}</span>
  </div>
  </div>
  </div>

  {/* Bottom mini stats — 4 across */}
  <div className="col-span-2 sm:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
  <div className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 shadow-sm"><div className="flex items-center gap-1.5 text-gray-400 mb-0.5"><Package size={12} /><span className="text-[10px]">In Transit</span></div><p className="text-base font-bold text-gray-800">{(data as any).loadingStats?.in_transit || 0}</p></div>
  <div className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 shadow-sm"><div className="flex items-center gap-1.5 text-gray-400 mb-0.5"><Clock size={12} /><span className="text-[10px]">Received</span></div><p className="text-base font-bold text-gray-800">{(data as any).loadingStats?.received || 0}</p></div>
  <div className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 shadow-sm"><div className="flex items-center gap-1.5 text-gray-400 mb-0.5"><IndianRupee size={12} /><span className="text-[10px]">Fuel Cost (30d)</span></div><p className="text-base font-bold text-gray-800">{data.fuel.total_cost.toLocaleString()}</p></div>
  <div className="bg-white rounded-lg px-3 py-2.5 border border-gray-100 shadow-sm"><div className="flex items-center gap-1.5 text-gray-400 mb-0.5"><TrendingUp size={12} /><span className="text-[10px]">Fuel Volume (30d)</span></div><p className="text-base font-bold text-gray-800">{data.fuel.total_liters.toFixed(0)}L</p></div>
  </div>

  {/* Operations Line Chart — full width */}
  <div className="col-span-2 sm:col-span-4 bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between mb-3">
  <div><h3 className="font-semibold text-gray-900 text-sm">Operations Trend</h3><p className="text-[10px] text-gray-400 mt-0.5">Bookings, Loadings, Receivings & Deliveries</p></div>
  <div className="p-1.5 bg-indigo-50 rounded-lg"><TrendingUp size={14} className="text-indigo-500" /></div>
  </div>
  <LineChartCard data={data} />
  </div>

  {/* Recent Bookings — full width */}
  <div className="col-span-2 sm:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm">
  <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
  <div className="flex items-center gap-2"><FileText size={15} className="text-gray-400" /><h3 className="font-semibold text-gray-900 text-sm">Recent Bookings</h3></div>
  <button onClick={() => onNavigate('bookings')} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700">View all</button>
  </div>
  <div className="overflow-x-auto">
  <table className="w-full text-sm">
  <thead><tr className="text-[11px] text-gray-400 uppercase tracking-wider">
  <th className="text-left py-2.5 px-4 sm:px-5 font-medium">LR #</th><th className="text-left py-2.5 px-4 sm:px-5 font-medium">Consignor</th><th className="text-left py-2.5 px-4 sm:px-5 font-medium hidden sm:table-cell">Consignee</th><th className="text-right py-2.5 px-4 sm:px-5 font-medium hidden md:table-cell">Amount</th><th className="text-right py-2.5 px-4 sm:px-5 font-medium">Status</th>
  </tr></thead>
  <tbody className="divide-y divide-gray-50">
  {data.recentBookings?.map((b: any) => (
  <tr key={b.id} onClick={() => onNavigate('bookings', b.id)} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
  <td className="py-2.5 px-4 sm:px-5 font-mono text-xs font-medium text-gray-800">{b.booking_no}</td>
  <td className="py-2.5 px-4 sm:px-5 text-xs text-gray-600 truncate max-w-[120px]">{b.consignor_name}</td>
  <td className="py-2.5 px-4 sm:px-5 text-xs text-gray-500 truncate max-w-[120px] hidden sm:table-cell">{b.consignee_name}</td>
  <td className="py-2.5 px-4 sm:px-5 text-xs text-right font-medium text-gray-700 hidden md:table-cell">{b.grand_total?.toLocaleString() || '-'}</td>
  <td className="py-2.5 px-4 sm:px-5 text-right">
  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>{b.status}</span>
  </td>
  </tr>
  ))}
  {!data.recentBookings?.length && <tr><td colSpan={5} className="text-center py-8 text-xs text-gray-400">No bookings yet</td></tr>}
  </tbody>
  </table>
  </div>
  </div>

  </div>{/* end bento grid */}

  {/* ── Activity Feed (right sidebar) ── */}
  <div className="w-full lg:w-80 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col max-h-[calc(100vh-8rem)] lg:sticky lg:top-4">
  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent">
  <Activity size={15} className="text-purple-500" />
  <h3 className="font-semibold text-gray-900 text-sm">Activity</h3>
  <span className="text-[10px] text-gray-400 ml-auto">{activity.length} events</span>
  </div>
  <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
  {activity.length === 0 ? (
  <p className="text-xs text-gray-400 text-center py-8">No recent activity</p>
  ) : (
  activity.map((ev: any, i: number) => {
  const icons: Record<string, any> = { booking: FileText, loading: PackageCheck, receiving: ArrowDownToLine, delivery: Package, invoice: FileText, expense: Receipt, payment: IndianRupee };
  const colors: Record<string, string> = { booking: 'text-indigo-600 bg-indigo-50', loading: 'text-green-600 bg-green-50', receiving: 'text-blue-600 bg-blue-50', delivery: 'text-orange-600 bg-orange-50', invoice: 'text-violet-600 bg-violet-50', expense: 'text-red-600 bg-red-50', payment: 'text-emerald-600 bg-emerald-50' };
  const labels: Record<string, string> = { booking: 'LRR', loading: 'Load', receiving: 'Receiving', delivery: 'Delivery', invoice: 'Invoice', expense: 'Expense', payment: 'Payment' };
  const Icon = icons[ev.type] || FileText;
  const date = ev.event_date || ev.created_at;
  return (
  <div key={`${ev.type}-${ev.id}-${i}`} className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
  <div className="flex items-start gap-2.5">
  <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${colors[ev.type] || 'bg-gray-100 text-gray-500'}`}>
  <Icon size={13} />
  </div>
  <div className="min-w-0 flex-1">
  <div className="flex items-center gap-1.5">
  <span className={`text-[10px] font-semibold uppercase ${colors[ev.type]?.split(' ')[0] || 'text-gray-500'}`}>{labels[ev.type] || ev.type}</span>
  {ev.status && <span className="text-[10px] text-gray-400">· {ev.status}</span>}
  </div>
  <p className="text-xs font-medium text-gray-800 truncate">{ev.ref}</p>
  <p className="text-[10px] text-gray-500 truncate">{ev.description || ''}</p>
  <p className="text-[9px] text-gray-400 mt-0.5">{date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</p>
  </div>
  </div>
  </div>
  );
  })
  )}
  </div>
  </div>

  </div>{/* end flex container */}
  </div>{/* end z-10 */}
  </div>
  );
}
