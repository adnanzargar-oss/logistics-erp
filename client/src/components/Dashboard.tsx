import { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { DashboardData } from '../types';
import { Search, X, TrendingUp, Package, Truck, Users, IndianRupee, Building2, ArrowUpRight, ArrowDownRight, Clock, FileText } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';

interface SearchResult {
  id: number;
  code: string;
  type: 'LRR' | 'Load' | 'Delivery';
  consignor_name?: string;
  consignee_name?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  'In Progress': 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  Booked: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  Unloaded: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const onNavigate = useNavigate();

  useEffect(() => {
    api.dashboard.get().then(setData).catch(console.error);
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
      <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
        <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    </div>
  );

  const maxMonth = Math.max(...data.monthlyBookings.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Good morning, Planet Transport</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your operations today.
          </p>
        </div>
        <div ref={searchRef} className="relative w-full sm:w-80">
          <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Search size={16} className="text-gray-400 mr-2 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => doSearch(e.target.value)}
              placeholder="Search LRR, consignor, load..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }} className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">No results found</p>
              ) : (
                searchResults.map((r, i) => (
                  <div
                    key={`${r.type}-${r.id}-${i}`}
                    onClick={() => { setShowResults(false); onNavigate(resultPage(r), r.id); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b last:border-0 border-gray-100 dark:border-gray-800"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      r.type === 'LRR' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300' :
                      r.type === 'Load' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300' :
                      'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}>
                      {r.type}
                    </span>
                    <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-100">{r.code}</span>
                    {r.consignor_name && <span className="text-xs text-gray-400 truncate">{r.consignor_name}</span>}
                    {r.consignee_name && <span className="text-xs text-gray-400 truncate">→ {r.consignee_name}</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => onNavigate('bookings')} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
              <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-[11px] text-gray-400">{data.bookings.total_bookings} total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.bookings.total_bookings}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Bookings</p>
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <span className="flex items-center gap-1 text-green-600"><ArrowUpRight size={11} />{data.bookings.completed} done</span>
            <span className="flex items-center gap-1 text-amber-600"><ArrowDownRight size={11} />{data.bookings.in_progress} active</span>
          </div>
        </div>

        <div onClick={() => onNavigate('fleet')} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <Truck size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[11px] text-gray-400">{data.vehicles.total} vehicles</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.vehicles.active}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active Vehicles</p>
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <span className="flex items-center gap-1 text-gray-500"><Users size={11} />{data.drivers.active} drivers</span>
          </div>
        </div>

        <div onClick={() => onNavigate('customers')} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
              <Building2 size={18} className="text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-[11px] text-gray-400">registered</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.customerCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customers</p>
        </div>

        <div onClick={() => onNavigate('invoices')} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
              <IndianRupee size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[11px] text-gray-400">{data.invoices.total} invoices</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.invoices.outstanding.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Outstanding</p>
          <div className="flex items-center gap-3 mt-2 text-[11px]">
            <span className="flex items-center gap-1 text-green-600"><ArrowUpRight size={11} />{data.payments.total_amount.toLocaleString()} collected</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Monthly Bookings Bar Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Monthly Bookings</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          {data.monthlyBookings.length === 0 ? (
            <p className="text-gray-400 text-sm py-12 text-center">No data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-44">
              {data.monthlyBookings.map((m) => {
                const h = (m.count / maxMonth) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</span>
                    <div className="w-full bg-indigo-50 dark:bg-indigo-950 rounded-t-md relative overflow-hidden" style={{ height: `${Math.max(h, 8)}%` }}>
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-600 dark:to-indigo-500 rounded-t-md transition-all group-hover:brightness-110" style={{ height: `${h}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Overview */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Financial Overview</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Revenue vs outstanding</p>
            </div>
            <IndianRupee size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Invoice Collection</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {data.invoices.total_amount > 0 ? ((data.invoices.paid_amount / data.invoices.total_amount) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${data.invoices.total_amount > 0 ? (data.invoices.paid_amount / data.invoices.total_amount) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3.5">
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Collected</p>
                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">{data.invoices.paid_amount.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3.5">
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">Outstanding</p>
                <p className="text-lg font-bold text-red-800 dark:text-red-200 mt-0.5">{data.invoices.outstanding.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400">Total invoiced</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{data.invoices.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recent Bookings</h3>
          </div>
          <button onClick={() => onNavigate('bookings')} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-gray-400 uppercase tracking-wider">
                <th className="text-left py-3 px-5 font-medium">LR #</th>
                <th className="text-left py-3 px-5 font-medium">Consignor</th>
                <th className="text-left py-3 px-5 font-medium hidden sm:table-cell">Consignee</th>
                <th className="text-right py-3 px-5 font-medium hidden md:table-cell">Amount</th>
                <th className="text-right py-3 px-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {(data as any).recentBookings?.map((b: any) => (
                <tr
                  key={b.id}
                  onClick={() => onNavigate('bookings', b.id)}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-5 font-mono text-xs font-medium text-gray-800 dark:text-gray-200">{b.booking_no}</td>
                  <td className="py-3 px-5 text-xs text-gray-600 dark:text-gray-300 truncate max-w-[140px]">{b.consignor_name}</td>
                  <td className="py-3 px-5 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px] hidden sm:table-cell">{b.consignee_name}</td>
                  <td className="py-3 px-5 text-xs text-right font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">{b.grand_total?.toLocaleString() || '-'}</td>
                  <td className="py-3 px-5 text-right">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!(data as any).recentBookings?.length && (
                <tr><td colSpan={5} className="text-center py-10 text-xs text-gray-400">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Package size={13} />
            <span className="text-[11px]">In Transit</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{(data as any).loadingStats?.in_transit || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Clock size={13} />
            <span className="text-[11px]">Received</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{(data as any).loadingStats?.received || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <IndianRupee size={13} />
            <span className="text-[11px]">Fuel Cost (30d)</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{data.fuel.total_cost.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <TrendingUp size={13} />
            <span className="text-[11px]">Fuel Volume (30d)</span>
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{data.fuel.total_liters.toFixed(0)}L</p>
        </div>
      </div>
    </div>
  );
}
