import { useEffect, useState } from 'react';
import { api } from '../api';
import { Driver } from '../types';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import Modal from './Modal';

export default function Drivers() {
 const [drivers, setDrivers] = useState<Driver[]>([]);
 const [modal, setModal] = useState(false);
 const [edit, setEdit] = useState<Driver | null>(null);
 const [form, setForm] = useState<Driver>({ name: '', phone: '', email: '', license_number: '', license_expiry: '', emergency_contact: '', emergency_phone: '', address: '' });

 const load = () => api.drivers.list().then(setDrivers);

 useEffect(() => { load(); }, []);

 const openCreate = () => { setEdit(null); setForm({ name: '', phone: '', email: '', license_number: '', license_expiry: '', emergency_contact: '', emergency_phone: '', address: '' }); setModal(true); };
 const openEdit = (d: Driver) => { setEdit(d); setForm(d); setModal(true); };

 const save = async () => {
 if (edit?.id) await api.drivers.update(edit.id, form);
 else await api.drivers.create(form);
 setModal(false); load();
 };

 const remove = async (id: number) => {
 if (confirm('Delete this driver?')) { await api.drivers.delete(id); load(); }
 };

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Users className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Drivers</h1>
 </div>
 <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Add Driver
 </button>
 </div>

 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr>
 <th className="text-left py-3 px-4">Name</th>
 <th className="text-left py-3 px-4">Phone</th>
 <th className="text-left py-3 px-4">License</th>
 <th className="text-left py-3 px-4">License Expiry</th>
 <th className="text-left py-3 px-4">Vehicle</th>
 <th className="text-left py-3 px-4">Status</th>
 <th className="text-left py-3 px-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
 {drivers.map((d) => (
 <tr key={d.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4 font-medium">{d.name}</td>
 <td className="py-3 px-4">{d.phone || '-'}</td>
 <td className="py-3 px-4">{d.license_number || '-'}</td>
 <td className="py-3 px-4 text-xs">{d.license_expiry ? new Date(d.license_expiry).toLocaleDateString() : '-'}</td>
 <td className="py-3 px-4 text-xs text-gray-500 ">{d.vehicle_reg || 'Unassigned'}</td>
 <td className="py-3 px-4">
 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === 'Active' ? 'bg-green-100 text-green-700 ' : 'bg-gray-100 text-gray-500 '}`}>{d.status}</span>
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-2">
 <button onClick={() => openEdit(d)} className="p-1 hover:bg-gray-100 :bg-gray-800 rounded"><Edit2 size={14} className="text-gray-400 " /></button>
 <button onClick={() => remove(d.id!)} className="p-1 hover:bg-red-50 :bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
 </div>
 </td>
 </tr>
 ))}
 {drivers.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400 ">No drivers added yet</td></tr>}
 </tbody>
 </table>
 </div>
 </div>

 <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Driver' : 'Add Driver'}>
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
 <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label><input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label><input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">License Number</label><input value={form.license_number || ''} onChange={(e) => setForm({ ...form, license_number: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">License Expiry</label><input type="date" value={form.license_expiry || ''} onChange={(e) => setForm({ ...form, license_expiry: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Emergency Contact</label><input value={form.emergency_contact || ''} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Emergency Phone</label><input value={form.emergency_phone || ''} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Address</label><textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} /></div>
 </div>
 <div className="flex justify-end gap-3 mt-6">
 <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 :bg-gray-800 rounded-lg">Cancel</button>
 <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
 </div>
 </Modal>
 </div>
 );
}
