import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Booking, Vehicle, Driver, Loading } from '../types';
import { PackageCheck, Plus, Trash2, Printer, Eye } from 'lucide-react';
import Modal from './Modal';
import { printLoadSheet } from './PrintLoadSheet';
import { consumeDetailId } from '../hooks/useNavigate';

export default function Loadings() {
  const [loadings, setLoadings] = useState<Loading[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableLRs, setAvailableLRs] = useState<Booking[]>([]);

  const [selectedVehicle, setSelectedVehicle] = useState<number | ''>('');
  const [selectedDriver, setSelectedDriver] = useState<number | ''>('');
  const [selectedLRs, setSelectedLRs] = useState<number[]>([]);
  const [loadingDate, setLoadingDate] = useState(new Date().toISOString().slice(0, 10));
  const [detail, setDetail] = useState<Loading | null>(null);
  const [tab, setTab] = useState<'new' | 'transit' | 'history'>('new');
  const [lrSearch, setLrSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'vehicle' | 'driver' | 'date'>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('');
  const [filterDriver, setFilterDriver] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [reviewOpen, setReviewOpen] = useState(false);

  const reviewLRs = availableLRs.filter((b) => selectedLRs.includes(b.id!));
  const transitLoadings = loadings.filter((l) => (l.bookings || []).some((b: any) => !b.received));
  const historyLoadings = loadings.filter((l) => (l.bookings || []).length > 0 && (l.bookings || []).every((b: any) => b.received));

  const filteredHistoryLoadings = historyLoadings.filter((l) => {
    if (filterMode === 'vehicle' && filterVehicle) return (l.vehicle_reg || '').toLowerCase().includes(filterVehicle.toLowerCase());
    if (filterMode === 'driver' && filterDriver) return (l.driver_name || '').toLowerCase().includes(filterDriver.toLowerCase());
    if (filterMode === 'date' && filterDate) return l.loading_date === filterDate;
    return true;
  });

  const load = useCallback(() => {
    Promise.all([
      api.loadings.list().then(setLoadings),
      api.vehicles.list('Active').then(setVehicles),
      api.drivers.list('Active').then(setDrivers),
      api.bookings.list('Booked').then((all) => {
        const unloaded = all.filter((b: Booking) => b.loaded !== 1);
        const inProgress = all.filter((b: Booking) => b.status === 'In Progress' && b.loaded !== 1);
        setAvailableLRs([...unloaded, ...inProgress]);
      }),
    ]);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = consumeDetailId();
    if (id) api.loadings.get(id).then(setDetail);
  }, []);

  // When vehicle changes, auto-select its assigned driver
  useEffect(() => {
    if (selectedVehicle) {
      const v = vehicles.find((v) => v.id === selectedVehicle);
      if (v) {
        const assigned = drivers.find((d) => d.vehicle_id === v.id);
        if (assigned) setSelectedDriver(assigned.id ?? '');
      }
    }
  }, [selectedVehicle, vehicles, drivers]);

  const toggleLR = (id: number) => {
    setSelectedLRs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveLoading = async () => {
    if (!selectedVehicle) { alert('Please select a vehicle'); return; }
    if (selectedLRs.length === 0) { alert('Please select at least one LR'); return; }
    setReviewOpen(true);
  };

  const confirmLoading = async () => {
    const driverId = selectedDriver || undefined;
    await api.loadings.create({
      vehicle_id: selectedVehicle,
      driver_id: driverId,
      loading_date: loadingDate,
      booking_ids: selectedLRs,
    });
    setReviewOpen(false);
    setSelectedLRs([]);
    setSelectedVehicle('');
    setSelectedDriver('');
    setLrSearch('');
    load();
  };

  const remove = async (id: number) => {
    if (confirm('Unload this vehicle? The LRs will be available for loading again.')) { await api.loadings.delete(id); setTab('new'); load(); }
  };

  const confirmRemoveLR = (id: number) => {
    setSelectedLRs((prev) => prev.filter((x) => x !== id));
  };

  const totalBags = (detail?.bookings || []).reduce((s, b) => s + (b.num_bags ?? 0), 0);
  const totalWeight = (detail?.bookings || []).reduce((s, b) => s + (b.charged_weight ?? b.actual_weight ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PackageCheck className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Loading</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('new')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'new' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>New Vehicle Loading</button>
        <button onClick={() => setTab('transit')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'transit' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>In Transit ({transitLoadings.length})</button>
        <button onClick={() => setTab('history')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'history' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Loading History ({historyLoadings.length})</button>
      </div>

      {/* New Loading Form */}
      {tab === 'new' && (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">New Vehicle Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle *</label>
            <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(Number(e.target.value) || '')} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id!}>{v.reg_number} ({v.type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Driver (auto-assigned)</label>
            <select value={selectedDriver} onChange={(e) => setSelectedDriver(Number(e.target.value) || '')} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select driver</option>
              {drivers.map((d) => <option key={d.id} value={d.id!}>{d.name} - {d.license_number || 'No license'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Loading Date</label>
            <input type="date" value={loadingDate} onChange={(e) => setLoadingDate(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={saveLoading} className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
              <Plus size={16} /> Complete Loading
            </button>
          </div>
        </div>

        {/* Available LRs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Select LR(s) to Load ({selectedLRs.length} selected)</label>
            <input type="text" placeholder="Search LR number..." value={lrSearch} onChange={(e) => setLrSearch(e.target.value)} className="w-48 border dark:border-gray-600 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          {availableLRs.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">No unloaded LRs available. Create a booking first.</p>
          ) : (
            <div className="border dark:border-gray-600 rounded-lg">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-2 px-3 w-8"></th>
                    <th className="text-left py-2 px-3">LR #</th>
                    <th className="text-left py-2 px-3">Consignee</th>
                    <th className="text-left py-2 px-3">Nags</th>
                    <th className="text-left py-2 px-3">Weight</th>
                    <th className="text-left py-2 px-3">From → To</th>
                    <th className="text-left py-2 px-3">E-Way Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {availableLRs.filter((b) => !lrSearch || b.booking_no?.toLowerCase().includes(lrSearch.toLowerCase())).map((b) => {
                    const selected = selectedLRs.includes(b.id!);
                    return (
                      <tr
                        key={b.id}
                        onClick={() => toggleLR(b.id!)}
                        className={`cursor-pointer text-xs ${
                          selected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'
                        }`}
                      >
                        <td className="py-2 px-3"><input type="checkbox" checked={selected} readOnly className="rounded" /></td>
                        <td className="py-2 px-3 font-mono font-medium">{b.booking_no}</td>
                        <td className="py-2 px-3 truncate max-w-[140px]">{b.consignee_name || '-'}</td>
                        <td className="py-2 px-3">{b.num_bags ?? '-'}</td>
                        <td className="py-2 px-3">{b.actual_weight || b.charged_weight ? `${b.actual_weight ?? b.charged_weight} kg` : '-'}</td>
                        <td className="py-2 px-3 text-gray-400 dark:text-gray-500">{b.from_location || '-'} → {b.to_location || '-'}</td>
                        <td className={`py-2 px-3 font-mono ${b.eway_bill_no ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-300 dark:text-gray-600'}`}>{b.eway_bill_no || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* In Transit */}
      {tab === 'transit' && (
      <>
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">In Transit ({transitLoadings.length})</h2>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Loading #</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Vehicle</th>
                <th className="text-left py-3 px-4">Driver</th>
                <th className="text-left py-3 px-4">License</th>
                <th className="text-left py-3 px-4">LRs Loaded</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {transitLoadings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                  <td className="py-3 px-4 font-mono text-xs font-medium">{l.loading_no}</td>
                  <td className="py-3 px-4 text-xs">{l.loading_date ? new Date(l.loading_date).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4 font-medium">{l.vehicle_reg || '-'}</td>
                  <td className="py-3 px-4">{l.driver_name || '-'}</td>
                  <td className="py-3 px-4 text-xs">{l.license_number || '-'}</td>
                  <td className="py-3 px-4 text-xs">{l.item_count ?? 0}</td>
                  <td className="py-3 px-4">
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-xs font-medium">In Transit</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => { api.loadings.get(l.id!).then(setDetail); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="View"><Eye size={14} className="text-gray-400 dark:text-gray-500" /></button>
                      <button onClick={() => { api.loadings.get(l.id!).then((d) => printLoadSheet(d)); }} className="p-1 hover:bg-blue-50 rounded" title="Print Load Sheet"><Printer size={14} className="text-blue-400" /></button>
                      <button onClick={() => remove(l.id!)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Unload"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {transitLoadings.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400 dark:text-gray-500">No loads in transit</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Loading History */}
      {tab === 'history' && (
      <>
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Loading History</h2>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          {(['all', 'vehicle', 'driver', 'date'] as const).map((m) => (
            <button key={m} onClick={() => { setFilterMode(m); setFilterVehicle(''); setFilterDriver(''); setFilterDate(''); }} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filterMode === m ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {m === 'all' ? 'All' : m === 'vehicle' ? 'By Vehicle' : m === 'driver' ? 'By Driver' : 'By Date'}
            </button>
          ))}
        </div>
        {filterMode === 'vehicle' && (
          <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} className="border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Vehicles</option>
            {[...new Set(historyLoadings.map((l) => l.vehicle_reg).filter(Boolean))].map((v) => <option key={v} value={v!}>{v}</option>)}
          </select>
        )}
        {filterMode === 'driver' && (
          <select value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)} className="border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">All Drivers</option>
            {[...new Set(historyLoadings.map((l) => l.driver_name).filter(Boolean))].map((d) => <option key={d} value={d!}>{d}</option>)}
          </select>
        )}
        {filterMode === 'date' && (
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        )}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Loading #</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Vehicle</th>
                <th className="text-left py-3 px-4">Driver</th>
                <th className="text-left py-3 px-4">License</th>
                <th className="text-left py-3 px-4">LRs Loaded</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredHistoryLoadings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                  <td className="py-3 px-4 font-mono text-xs font-medium">{l.loading_no}</td>
                  <td className="py-3 px-4 text-xs">{l.loading_date ? new Date(l.loading_date).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4 font-medium">{l.vehicle_reg || '-'}</td>
                  <td className="py-3 px-4">{l.driver_name || '-'}</td>
                  <td className="py-3 px-4 text-xs">{l.license_number || '-'}</td>
                  <td className="py-3 px-4 text-xs">{l.item_count ?? 0}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">{l.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => { api.loadings.get(l.id!).then(setDetail); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="View"><Eye size={14} className="text-gray-400 dark:text-gray-500" /></button>
                      <button onClick={() => { api.loadings.get(l.id!).then((d) => printLoadSheet(d)); }} className="p-1 hover:bg-blue-50 rounded" title="Print Load Sheet"><Printer size={14} className="text-blue-400" /></button>
                      <button onClick={() => remove(l.id!)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Unload"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistoryLoadings.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400 dark:text-gray-500">{filterMode !== 'all' ? 'No loads match your filter' : 'No loads yet'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Review Modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Review Loading" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-400 dark:text-gray-500">Vehicle:</span> <span className="font-medium">{vehicles.find((v) => v.id === selectedVehicle)?.reg_number || '-'}</span></div>
            <div><span className="text-gray-400 dark:text-gray-500">Driver:</span> {drivers.find((d) => d.id === selectedDriver)?.name || '-'}</div>
            <div><span className="text-gray-400 dark:text-gray-500">Date:</span> {loadingDate ? new Date(loadingDate).toLocaleDateString() : '-'}</div>
            <div><span className="text-gray-400 dark:text-gray-500">LRs:</span> {selectedLRs.length}</div>
          </div>
          <div className="border dark:border-gray-600 rounded-lg">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left py-2 px-3">LR #</th>
                  <th className="text-left py-2 px-3">Consignor</th>
                  <th className="text-left py-2 px-3">Consignee</th>
                  <th className="text-left py-2 px-3">From → To</th>
                  <th className="text-left py-2 px-3">Nags</th>
                  <th className="text-left py-2 px-3">Weight</th>
                  <th className="text-left py-2 px-3">E-Way Bill</th>
                  <th className="text-left py-2 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reviewLRs.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 text-xs">
                    <td className="py-2 px-3 font-mono font-medium">{b.booking_no}</td>
                    <td className="py-2 px-3 max-w-[120px] truncate">{b.consignor_name || '-'}</td>
                    <td className="py-2 px-3 max-w-[120px] truncate">{b.consignee_name || '-'}</td>
                    <td className="py-2 px-3">{b.from_location || '-'} → {b.to_location || '-'}</td>
                    <td className="py-2 px-3">{b.num_bags ?? '-'}</td>
                    <td className="py-2 px-3">{b.charged_weight ?? b.actual_weight ?? '-'}</td>
                    <td className="py-2 px-3 font-mono text-[10px]">{b.eway_bill_no || '-'}</td>
                    <td className="py-2 px-3">
                      <button onClick={() => confirmRemoveLR(b.id!)} className="text-red-400 hover:text-red-600 p-1" title="Remove"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-900 font-semibold text-xs">
                <tr>
                  <td colSpan={4} className="py-2 px-3 text-right">TOTAL:</td>
                  <td className="py-2 px-3">{reviewLRs.reduce((s, b) => s + (b.num_bags ?? 0), 0)}</td>
                  <td className="py-2 px-3">{reviewLRs.reduce((s, b) => s + (b.charged_weight ?? b.actual_weight ?? 0), 0)} kg</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setReviewOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Back</button>
            <div className="flex gap-2">
              <button onClick={() => {
                const loading: any = {
                  loading_no: 'New',
                  vehicle_id: selectedVehicle,
                  driver_id: selectedDriver,
                  loading_date: loadingDate,
                  vehicle_reg: vehicles.find((v) => v.id === selectedVehicle)?.reg_number,
                  driver_name: drivers.find((d) => d.id === selectedDriver)?.name,
                  bookings: reviewLRs,
                };
                printLoadSheet(loading);
              }} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"><Printer size={16} /> Print</button>
              <button onClick={confirmLoading} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"><PackageCheck size={16} /> Confirm & Save</button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Load Sheet: ${detail?.loading_no || ''}`} wide>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-400 dark:text-gray-500">Vehicle:</span> <span className="font-medium">{detail.vehicle_reg}</span></div>
              <div><span className="text-gray-400 dark:text-gray-500">Driver:</span> {detail.driver_name || '-'}</div>
              <div><span className="text-gray-400 dark:text-gray-500">License:</span> {detail.license_number || '-'}</div>
              <div><span className="text-gray-400 dark:text-gray-500">Date:</span> {detail.loading_date ? new Date(detail.loading_date).toLocaleDateString() : '-'}</div>
            </div>
            <div className="border dark:border-gray-600 rounded-lg">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left py-2 px-3">LR #</th>
                    <th className="text-left py-2 px-3">Consignor</th>
                    <th className="text-left py-2 px-3">Consignee</th>
                    <th className="text-left py-2 px-3">From → To</th>
                    <th className="text-left py-2 px-3">Nags</th>
                    <th className="text-left py-2 px-3">Weight</th>
                    <th className="text-left py-2 px-3">E-Way Bill</th>
                    <th className="text-left py-2 px-3">Freight</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(detail.bookings || []).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 text-xs">
                      <td className="py-2 px-3 font-mono font-medium">{b.booking_no}</td>
                      <td className="py-2 px-3 max-w-[120px] truncate">{b.consignor_name || '-'}</td>
                      <td className="py-2 px-3 max-w-[120px] truncate">{b.consignee_name || '-'}</td>
                      <td className="py-2 px-3">{b.from_location || '-'} → {b.to_location || '-'}</td>
                      <td className="py-2 px-3">{b.num_bags ?? '-'}</td>
                      <td className="py-2 px-3">{b.charged_weight ?? b.actual_weight ?? '-'}</td>
                      <td className="py-2 px-3 font-mono text-[10px]">{b.eway_bill_no || '-'}</td>
                      <td className="py-2 px-3">{(b.freight ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900 font-semibold text-xs">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right">TOTAL:</td>
                    <td className="py-2 px-3">{totalBags}</td>
                    <td className="py-2 px-3">{totalWeight} kg</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={() => printLoadSheet(detail)} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
                <Printer size={16} /> Print Load Sheet
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
