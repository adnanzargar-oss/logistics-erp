import { useEffect, useState } from 'react';
import { api } from '../api';
import { FuelEntry, Vehicle } from '../types';
import { Plus, Trash2, Fuel } from 'lucide-react';
import Modal from './Modal';

export default function FuelTracking() {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FuelEntry>({
    vehicle_id: 0, fuel_date: new Date().toISOString().slice(0, 10),
    quantity_ltr: 0, cost_per_ltr: 0, total_cost: 0, odometer_km: undefined,
    station_name: '', payment_type: 'Cash', paid_by: 'Company', notes: '',
  });

  const load = () => Promise.all([
    api.fuel.list().then(setEntries),
    api.vehicles.list().then(setVehicles),
  ]);

  useEffect(() => { load(); }, []);

  const calcTotal = (q: number, c: number) => q * c;

  const save = async () => {
    await api.fuel.create({ ...form, total_cost: calcTotal(form.quantity_ltr, form.cost_per_ltr) });
    setModal(false); load();
  };

  const remove = async (id: number) => {
    if (confirm('Delete this fuel entry?')) { await api.fuel.delete(id); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Fuel className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Fuel Tracking</h1>
        </div>
        <button onClick={() => { setForm({ vehicle_id: 0, fuel_date: new Date().toISOString().slice(0, 10), quantity_ltr: 0, cost_per_ltr: 0, total_cost: 0, odometer_km: undefined, station_name: '', payment_type: 'Cash', paid_by: 'Company', notes: '' }); setModal(true); }}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus size={16} /> Add Fuel Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm dark:shadow-gray-900/30 border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Entries</p>
          <p className="text-xl font-bold">{entries.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm dark:shadow-gray-900/30 border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Liters</p>
          <p className="text-xl font-bold">{entries.reduce((s, e) => s + e.quantity_ltr, 0).toFixed(1)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm dark:shadow-gray-900/30 border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
          <p className="text-xl font-bold">{entries.reduce((s, e) => s + e.total_cost, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm dark:shadow-gray-900/30 border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Cost/Ltr</p>
          <p className="text-xl font-bold">
            {entries.length > 0 ? (entries.reduce((s, e) => s + e.total_cost, 0) / entries.reduce((s, e) => s + e.quantity_ltr, 0)).toFixed(2) : '0'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Vehicle</th><th className="text-left py-3 px-4">Liters</th><th className="text-left py-3 px-4">Cost/Ltr</th><th className="text-left py-3 px-4">Total Cost</th><th className="text-left py-3 px-4">Odometer</th><th className="text-left py-3 px-4">Station</th><th className="text-left py-3 px-4">Paid By</th><th className="text-left py-3 px-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                  <td className="py-3 px-4 text-xs">{new Date(e.fuel_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-medium">{e.vehicle_reg || `#${e.vehicle_id}`}</td>
                  <td className="py-3 px-4">{e.quantity_ltr}</td>
                  <td className="py-3 px-4">{e.cost_per_ltr}</td>
                  <td className="py-3 px-4 font-medium">{e.total_cost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{e.odometer_km ? `${e.odometer_km} km` : '-'}</td>
                  <td className="py-3 px-4 text-xs">{e.station_name || '-'}</td>
                  <td className="py-3 px-4 text-xs">{e.paid_by}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => remove(e.id!)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400 dark:text-gray-500">No fuel entries yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Fuel Entry">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle *</label>
            <select value={form.vehicle_id || ''} onChange={(e) => setForm({ ...form, vehicle_id: Number(e.target.value) })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id!}>{v.reg_number}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date *</label><input type="date" value={form.fuel_date} onChange={(e) => setForm({ ...form, fuel_date: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quantity (Ltr) *</label><input type="number" step="0.01" value={form.quantity_ltr || ''} onChange={(e) => { const q = Number(e.target.value); setForm({ ...form, quantity_ltr: q, total_cost: calcTotal(q, form.cost_per_ltr) }); }} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cost/Ltr *</label><input type="number" step="0.01" value={form.cost_per_ltr || ''} onChange={(e) => { const c = Number(e.target.value); setForm({ ...form, cost_per_ltr: c, total_cost: calcTotal(form.quantity_ltr, c) }); }} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Cost</label><input type="number" value={form.total_cost || ''} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300" readOnly /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Odometer (km)</label><input type="number" value={form.odometer_km || ''} onChange={(e) => setForm({ ...form, odometer_km: Number(e.target.value) || undefined })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Station Name</label><input value={form.station_name || ''} onChange={(e) => setForm({ ...form, station_name: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Type</label>
            <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>Cash</option><option>Credit Card</option><option>Fuel Card</option><option>UPI</option>
            </select>
          </div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Paid By</label>
            <select value={form.paid_by} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>Company</option><option>Driver</option><option>Employee</option>
            </select>
          </div>
          <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
        </div>
      </Modal>
    </div>
  );
}
