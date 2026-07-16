import { useEffect, useState } from 'react';
import { api } from '../api';
import { Truck, User, Phone, FileText, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from './Modal';

const VEHICLE_TYPES = ['Truck', 'Trailer', 'Container', 'Van', 'Tanker', 'Mini Truck', 'Container Truck'];

interface FleetVehicle {
 id: number;
 reg_number: string;
 type: string;
 model?: string;
 year?: number;
 chassis_number?: string;
 fuel_type?: string;
 capacity_kg?: number;
 status: string;
 insurance_expiry?: string;
 permit_expiry?: string;
 fitness_expiry?: string;
 driver_id?: number | null;
 driver_name?: string | null;
 driver_phone?: string | null;
 driver_email?: string | null;
 driver_license?: string | null;
 driver_license_expiry?: string | null;
 driver_emergency_contact?: string | null;
 driver_emergency_phone?: string | null;
 driver_address?: string | null;
 driver_status?: string | null;
}

export default function Fleet() {
  const [fleet, setFleet] = useState<FleetVehicle[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modal, setModal] = useState(false);
 const [edit, setEdit] = useState<FleetVehicle | null>(null);
 const [form, setForm] = useState<any>({
 reg_number: '', type: 'Truck', model: '', year: '', chassis_number: '', fuel_type: 'Diesel',
 capacity_kg: '', insurance_expiry: '', permit_expiry: '', fitness_expiry: '', status: 'Active',
 driver_name: '', driver_phone: '', driver_email: '', driver_license: '', driver_license_expiry: '',
 driver_emergency_contact: '', driver_emergency_phone: '', driver_address: '', driver_status: 'Active',
 });

 const load = () => fetch('/api/fleet').then((r) => r.json()).then(setFleet);

 useEffect(() => { load(); }, []);

 const openCreate = () => {
 setEdit(null);
 setForm({
 reg_number: '', type: 'Truck', model: '', year: '', chassis_number: '', fuel_type: 'Diesel',
 capacity_kg: '', insurance_expiry: '', permit_expiry: '', fitness_expiry: '', status: 'Active',
 driver_name: '', driver_phone: '', driver_email: '', driver_license: '', driver_license_expiry: '',
 driver_emergency_contact: '', driver_emergency_phone: '', driver_address: '', driver_status: 'Active',
 });
 setModal(true);
 };

 const openEdit = (v: FleetVehicle) => {
 setEdit(v);
 setForm({
 reg_number: v.reg_number, type: v.type, model: v.model || '', year: v.year || '',
 chassis_number: v.chassis_number || '', fuel_type: v.fuel_type || 'Diesel',
 capacity_kg: v.capacity_kg || '', insurance_expiry: v.insurance_expiry || '',
 permit_expiry: v.permit_expiry || '', fitness_expiry: v.fitness_expiry || '',
 status: v.status || 'Active',
 driver_id: v.driver_id || null,
 driver_name: v.driver_name || '', driver_phone: v.driver_phone || '',
 driver_email: v.driver_email || '', driver_license: v.driver_license || '',
 driver_license_expiry: v.driver_license_expiry || '',
 driver_emergency_contact: v.driver_emergency_contact || '',
 driver_emergency_phone: v.driver_emergency_phone || '',
 driver_address: v.driver_address || '', driver_status: v.driver_status || 'Active',
 });
 setModal(true);
 };

 const save = async () => {
 if (edit?.id) {
 await fetch(`/api/fleet/${edit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
 } else {
 const v = await api.vehicles.create(form);
 if (form.driver_name) {
 await api.drivers.create({ ...form, vehicle_id: v.id, name: form.driver_name });
 }
 }
 setModal(false); load();
 };

 const remove = async (id: number, driverId?: number | null) => {
 if (!confirm('Delete this vehicle?')) return;
 if (driverId) await api.drivers.delete(driverId);
 await api.vehicles.delete(id);
 load();
 };

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Truck className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Fleet</h1>
 <span className="text-xs text-gray-400 ml-1">({fleet.length})</span>
 </div>
 <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Add Vehicle
 </button>
  </div>

  <div className="mb-4">
  <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
    placeholder="Search by registration, driver name, phone, type..."
    className="max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white text-gray-800 placeholder:text-gray-400" />
  </div>

  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr>
 <th className="text-left py-3 px-4">Vehicle</th>
 <th className="text-left py-3 px-4">Type / Model</th>
 <th className="text-left py-3 px-4">Driver</th>
 <th className="text-left py-3 px-4">License</th>
 <th className="text-left py-3 px-4">Contact</th>
 <th className="text-left py-3 px-4">Status</th>
 <th className="text-right py-3 px-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
  {fleet.filter((v) => {
    const q = searchText.toLowerCase();
    return !q || v.reg_number.toLowerCase().includes(q) || v.driver_name?.toLowerCase().includes(q) ||
      v.driver_phone?.includes(q) || v.type?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q);
  }).map((v) => (
 <tr key={v.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
 <Truck size={14} className="text-indigo-600 " />
 </div>
 <div>
 <p className="font-medium text-gray-800 text-sm">{v.reg_number}</p>
 <p className="text-[10px] text-gray-400">{v.fuel_type} &middot; {v.capacity_kg ? `${v.capacity_kg} kg` : '-'}</p>
 </div>
 </div>
 </td>
 <td className="py-3 px-4 text-xs text-gray-500 ">
 <p>{v.type}</p>
 {v.model && <p className="text-[10px] text-gray-400">{v.model}{v.year ? ` (${v.year})` : ''}</p>}
 </td>
 <td className="py-3 px-4">
 {v.driver_name ? (
 <div className="flex items-center gap-1.5">
 <User size={12} className="text-gray-400 shrink-0" />
 <span className="text-sm text-gray-700 ">{v.driver_name}</span>
 </div>
 ) : <span className="text-xs text-gray-400">Unassigned</span>}
 </td>
 <td className="py-3 px-4 text-xs text-gray-500 ">
 {v.driver_license ? <p>{v.driver_license}</p> : '-'}
 {v.driver_license_expiry && <p className="text-[10px] text-gray-400">Exp: {new Date(v.driver_license_expiry).toLocaleDateString()}</p>}
 </td>
 <td className="py-3 px-4 text-xs text-gray-500 ">
 {v.driver_phone && <p className="flex items-center gap-1"><Phone size={10} />{v.driver_phone}</p>}
 {!v.driver_phone && '-'}
 </td>
 <td className="py-3 px-4">
 <div className="flex flex-wrap gap-1">
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v.status === 'Active' ? 'bg-green-100 text-green-700 ' : 'bg-gray-100 text-gray-500 '}`}>{v.status}</span>
 {v.driver_name && (
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v.driver_status === 'Active' ? 'bg-blue-100 text-blue-700 ' : 'bg-gray-100 text-gray-500 '}`}>D: {v.driver_status}</span>
 )}
 </div>
 </td>
 <td className="py-3 px-4 text-right">
 <div className="flex gap-1 justify-end">
 <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-gray-100 :bg-gray-800 rounded"><Edit2 size={14} className="text-gray-400 " /></button>
 <button onClick={() => remove(v.id, v.driver_id)} className="p-1.5 hover:bg-red-50 :bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
 </div>
 </td>
 </tr>
 ))}
 {fleet.length === 0 && (
 <tr><td colSpan={7} className="text-center py-10 text-gray-400 ">No vehicles added yet</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Vehicle & Driver' : 'Add Vehicle & Driver'}>
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Truck size={14} /> Vehicle Details</h3>
 </div>
 <div className="col-span-2 sm:col-span-1">
  <label className="block text-xs font-medium text-gray-500 mb-1">Reg Number *</label>
  <input value={form.reg_number} onChange={(e) => setForm({ ...form, reg_number: e.target.value.toUpperCase() })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., JK01AC-1234" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
 <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
 </select>
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
 <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
 <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Chassis Number</label>
 <input value={form.chassis_number} onChange={(e) => setForm({ ...form, chassis_number: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Fuel Type</label>
 <select value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"><option>Diesel</option><option>Petrol</option><option>Electric</option><option>CNG</option></select>
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Capacity (kg)</label>
 <input type="number" value={form.capacity_kg} onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Status</label>
 <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"><option>Active</option><option>Inactive</option><option>Under Maintenance</option></select>
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Insurance Expiry</label>
 <input type="date" value={form.insurance_expiry} onChange={(e) => setForm({ ...form, insurance_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Permit Expiry</label>
 <input type="date" value={form.permit_expiry} onChange={(e) => setForm({ ...form, permit_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Fitness Expiry</label>
 <input type="date" value={form.fitness_expiry} onChange={(e) => setForm({ ...form, fitness_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>

 <div className="col-span-2 mt-2">
 <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User size={14} /> Driver Details</h3>
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Driver Name</label>
 <input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Leave empty if no driver assigned" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
 <input value={form.driver_phone} onChange={(e) => setForm({ ...form, driver_phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
 <input type="email" value={form.driver_email} onChange={(e) => setForm({ ...form, driver_email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
  <label className="block text-xs font-medium text-gray-500 mb-1">License Number</label>
  <input value={form.driver_license} onChange={(e) => setForm({ ...form, driver_license: e.target.value.toUpperCase() })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">License Expiry</label>
 <input type="date" value={form.driver_license_expiry} onChange={(e) => setForm({ ...form, driver_license_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Emergency Contact</label>
 <input value={form.driver_emergency_contact} onChange={(e) => setForm({ ...form, driver_emergency_contact: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Emergency Phone</label>
 <input value={form.driver_emergency_phone} onChange={(e) => setForm({ ...form, driver_emergency_phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Driver Status</label>
 <select value={form.driver_status} onChange={(e) => setForm({ ...form, driver_status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"><option>Active</option><option>Inactive</option><option>Suspended</option></select>
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Driver Address</label>
 <textarea value={form.driver_address} onChange={(e) => setForm({ ...form, driver_address: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} />
 </div>
 </div>
 <div className="flex justify-end gap-3 mt-6">
 <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 :bg-gray-800 rounded-lg">Cancel</button>
 <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
 </div>
 </Modal>
 </div>
 );
}
