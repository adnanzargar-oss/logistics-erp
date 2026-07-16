import { useEffect, useState } from 'react';
import { api } from '../api';
import { MaintenanceRecord, Vehicle } from '../types';
import { Plus, Trash2, Wrench, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function Maintenance() {
 const [records, setRecords] = useState<MaintenanceRecord[]>([]);
 const [upcoming, setUpcoming] = useState<MaintenanceRecord[]>([]);
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [modal, setModal] = useState(false);
 const [form, setForm] = useState<MaintenanceRecord>({
 vehicle_id: 0, service_date: new Date().toISOString().slice(0, 10),
 service_type: 'General', description: '', odometer_km: undefined,
 labor_cost: 0, parts_cost: 0, tax_amount: 0, total_cost: 0,
 provider_name: '', next_service_date: '', next_service_km: undefined,
 });

 const load = () => Promise.all([
 api.maintenance.list().then(setRecords),
 api.maintenance.upcoming().then(setUpcoming),
 api.vehicles.list().then(setVehicles),
 ]);

 useEffect(() => { load(); }, []);

 const calcTotal = (labor: number, parts: number, tax: number) => labor + parts + tax;

 const save = async () => {
 await api.maintenance.create({ ...form, total_cost: calcTotal(form.labor_cost || 0, form.parts_cost || 0, form.tax_amount || 0) });
 setModal(false); load();
 };

 const remove = async (id: number) => {
 if (confirm('Delete this maintenance record?')) { await api.maintenance.delete(id); load(); }
 };

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Wrench className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Fleet Maintenance</h1>
 </div>
 <button onClick={() => { setForm({ vehicle_id: 0, service_date: new Date().toISOString().slice(0, 10), service_type: 'General', description: '', odometer_km: undefined, labor_cost: 0, parts_cost: 0, tax_amount: 0, total_cost: 0, provider_name: '', next_service_date: '', next_service_km: undefined }); setModal(true); }}
 className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Add Service Record
 </button>
 </div>

 {upcoming.length > 0 && (
 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
 <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
 <AlertTriangle size={16} /> Upcoming Maintenance ({upcoming.length})
 </div>
 <div className="flex gap-3 overflow-x-auto scrollbar-hide">
 {upcoming.slice(0, 5).map((m) => (
 <div key={m.id} className="bg-white rounded-lg px-3 py-2 text-xs border border-amber-100 whitespace-nowrap">
 <span className="font-medium">{m.vehicle_reg}</span> - {m.next_service_date ? new Date(m.next_service_date).toLocaleDateString() : 'N/A'}
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Vehicle</th><th className="text-left py-3 px-4">Service Type</th><th className="text-left py-3 px-4">Odometer</th><th className="text-left py-3 px-4">Labor</th><th className="text-left py-3 px-4">Parts</th><th className="text-left py-3 px-4">Total</th><th className="text-left py-3 px-4">Provider</th><th className="text-left py-3 px-4">Next Service</th><th className="text-left py-3 px-4">Actions</th></tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
 {records.map((r) => (
 <tr key={r.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4 text-xs">{new Date(r.service_date).toLocaleDateString()}</td>
 <td className="py-3 px-4 font-medium">{r.vehicle_reg || `#${r.vehicle_id}`}</td>
 <td className="py-3 px-4">{r.service_type}</td>
 <td className="py-3 px-4 text-xs">{r.odometer_km ? `${r.odometer_km} km` : '-'}</td>
 <td className="py-3 px-4">{(r.labor_cost || 0).toLocaleString()}</td>
 <td className="py-3 px-4">{(r.parts_cost || 0).toLocaleString()}</td>
 <td className="py-3 px-4 font-medium">{(r.total_cost || 0).toLocaleString()}</td>
 <td className="py-3 px-4 text-xs">{r.provider_name || '-'}</td>
 <td className="py-3 px-4 text-xs">{r.next_service_date ? new Date(r.next_service_date).toLocaleDateString() : '-'}</td>
 <td className="py-3 px-4">
 <button onClick={() => remove(r.id!)} className="p-1 hover:bg-red-50 :bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
 </td>
 </tr>
 ))}
 {records.length === 0 && <tr><td colSpan={10} className="text-center py-10 text-gray-400 ">No maintenance records yet</td></tr>}
 </tbody>
 </table>
 </div>
 </div>

 <Modal open={modal} onClose={() => setModal(false)} title="Add Service Record" wide>
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle *</label>
 <select value={form.vehicle_id || ''} onChange={(e) => setForm({ ...form, vehicle_id: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option value="">Select vehicle</option>
 {vehicles.map((v) => <option key={v.id} value={v.id!}>{v.reg_number}</option>)}
 </select>
 </div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Service Date *</label><input type="date" value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Service Type *</label>
 <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>General</option><option>Oil Change</option><option>Engine</option><option>Brake</option><option>Tire</option><option>AC Service</option><option>Air Filter</option><option>Battery</option><option>Other</option>
 </select>
 </div>
 <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Description</label><textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Odometer (km)</label><input type="number" value={form.odometer_km || ''} onChange={(e) => setForm({ ...form, odometer_km: Number(e.target.value) || undefined })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Provider Name</label><input value={form.provider_name || ''} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Labor Cost</label><input type="number" value={form.labor_cost || ''} onChange={(e) => { const v = Number(e.target.value); setForm({ ...form, labor_cost: v, total_cost: calcTotal(v, form.parts_cost || 0, form.tax_amount || 0) }); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Parts Cost</label><input type="number" value={form.parts_cost || ''} onChange={(e) => { const v = Number(e.target.value); setForm({ ...form, parts_cost: v, total_cost: calcTotal(form.labor_cost || 0, v, form.tax_amount || 0) }); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Tax Amount</label><input type="number" value={form.tax_amount || ''} onChange={(e) => { const v = Number(e.target.value); setForm({ ...form, tax_amount: v, total_cost: calcTotal(form.labor_cost || 0, form.parts_cost || 0, v) }); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Total Cost</label><input type="number" value={form.total_cost || ''} className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 " readOnly /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Next Service Date</label><input type="date" value={form.next_service_date || ''} onChange={(e) => setForm({ ...form, next_service_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Next Service (km)</label><input type="number" value={form.next_service_km || ''} onChange={(e) => setForm({ ...form, next_service_km: Number(e.target.value) || undefined })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 </div>
 <div className="flex justify-end gap-3 mt-6">
 <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 :bg-gray-800 rounded-lg">Cancel</button>
 <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
 </div>
 </Modal>
 </div>
 );
}
