import { useEffect, useState } from 'react';
import { api } from '../api';
import { Vehicle } from '../types';
import { Plus, Edit2, Trash2, Truck } from 'lucide-react';
import Modal from './Modal';

export default function Vehicles() {
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [modal, setModal] = useState(false);
 const [edit, setEdit] = useState<Vehicle | null>(null);
 const [form, setForm] = useState<Vehicle>({ reg_number: '', type: 'Truck', model: '', year: undefined, chassis_number: '', fuel_type: 'Diesel', capacity_kg: undefined, insurance_expiry: '', permit_expiry: '', fitness_expiry: '' });

 const load = () => api.vehicles.list().then(setVehicles);

 useEffect(() => { load(); }, []);

 const openCreate = () => { setEdit(null); setForm({ reg_number: '', type: 'Truck', model: '', year: undefined, chassis_number: '', fuel_type: 'Diesel', capacity_kg: undefined, insurance_expiry: '', permit_expiry: '', fitness_expiry: '' }); setModal(true); };
 const openEdit = (v: Vehicle) => { setEdit(v); setForm(v); setModal(true); };

 const save = async () => {
 if (edit?.id) await api.vehicles.update(edit.id, form);
 else await api.vehicles.create(form);
 setModal(false); load();
 };

 const remove = async (id: number) => {
 if (confirm('Delete this vehicle?')) {
 await api.vehicles.delete(id); load();
 }
 };

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Truck className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Vehicles</h1>
 </div>
 <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Add Vehicle
 </button>
 </div>

 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr>
 <th className="text-left py-3 px-4">Reg Number</th>
 <th className="text-left py-3 px-4">Type</th>
 <th className="text-left py-3 px-4">Model</th>
 <th className="text-left py-3 px-4">Fuel</th>
 <th className="text-left py-3 px-4">Capacity</th>
 <th className="text-left py-3 px-4">Status</th>
 <th className="text-left py-3 px-4">Insurance</th>
 <th className="text-left py-3 px-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
 {vehicles.map((v) => (
 <tr key={v.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4 font-medium">{v.reg_number}</td>
 <td className="py-3 px-4">{v.type}</td>
 <td className="py-3 px-4 text-gray-500 ">{v.model || '-'}</td>
 <td className="py-3 px-4">{v.fuel_type}</td>
 <td className="py-3 px-4">{v.capacity_kg ? `${v.capacity_kg} kg` : '-'}</td>
 <td className="py-3 px-4">
 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.status === 'Active' ? 'bg-green-100 text-green-700 ' : 'bg-gray-100 text-gray-500 '}`}>{v.status}</span>
 </td>
 <td className="py-3 px-4 text-xs text-gray-500 ">{v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : '-'}</td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 <button onClick={() => openEdit(v)} className="p-1 hover:bg-gray-100 :bg-gray-800 rounded"><Edit2 size={14} className="text-gray-400 " /></button>
 <button onClick={() => remove(v.id!)} className="p-1 hover:bg-red-50 :bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
 </div>
 </td>
 </tr>
 ))}
 {vehicles.length === 0 && (
 <tr><td colSpan={8} className="text-center py-10 text-gray-400 ">No vehicles added yet</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Vehicle' : 'Add Vehicle'}>
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Registration Number *</label>
 <input value={form.reg_number} onChange={(e) => setForm({ ...form, reg_number: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., KL-01-AB-1234" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
 <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>Truck</option><option>Trailer</option><option>Container</option><option>Van</option><option>Tanker</option>
 </select>
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
 <input value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
 <input type="number" value={form.year || ''} onChange={(e) => setForm({ ...form, year: Number(e.target.value) || undefined })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Chassis Number</label>
 <input value={form.chassis_number || ''} onChange={(e) => setForm({ ...form, chassis_number: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Fuel Type</label>
 <select value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>Diesel</option><option>Petrol</option><option>Electric</option><option>CNG</option>
 </select>
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Capacity (kg)</label>
 <input type="number" value={form.capacity_kg || ''} onChange={(e) => setForm({ ...form, capacity_kg: Number(e.target.value) || undefined })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
 <select value={form.status || 'Active'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>Active</option><option>Inactive</option><option>Under Maintenance</option>
 </select>
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Insurance Expiry</label>
 <input type="date" value={form.insurance_expiry || ''} onChange={(e) => setForm({ ...form, insurance_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2 sm:col-span-1">
 <label className="block text-xs font-medium text-gray-500 mb-1">Permit Expiry</label>
 <input type="date" value={form.permit_expiry || ''} onChange={(e) => setForm({ ...form, permit_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Fitness Expiry</label>
 <input type="date" value={form.fitness_expiry || ''} onChange={(e) => setForm({ ...form, fitness_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
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
