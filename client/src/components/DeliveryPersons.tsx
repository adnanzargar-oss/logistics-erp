import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { DeliveryPerson } from '../types';
import { User, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function DeliveryPersons() {
 const [persons, setPersons] = useState<DeliveryPerson[]>([]);
 const [modal, setModal] = useState(false);
 const [editId, setEditId] = useState<number | null>(null);
 const [form, setForm] = useState<DeliveryPerson>({ name: '', phone: '', vehicle_number: '' });

 const load = useCallback(() => {
 api.deliveryPersons.list().then(setPersons);
 }, []);

 useEffect(() => { load(); }, [load]);

 const openCreate = () => { setEditId(null); setForm({ name: '', phone: '', vehicle_number: '' }); setModal(true); };
 const openEdit = (p: DeliveryPerson) => { setEditId(p.id ?? null); setForm({ ...p }); setModal(true); };

 const save = async () => {
 if (!form.name.trim()) { alert('Name is required'); return; }
 if (editId) await api.deliveryPersons.update(editId, form);
 else await api.deliveryPersons.create(form);
 setModal(false); load();
 };

 const remove = async (id: number) => {
 if (confirm('Delete this delivery person?')) { await api.deliveryPersons.delete(id); load(); }
 };

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <User className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Delivery Persons</h1>
 </div>
 <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Add Person
 </button>
 </div>

 <div className="bg-white rounded-xl border border-gray-100 shadow-sm ">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr>
 <th className="text-left py-3 px-4">Name</th>
 <th className="text-left py-3 px-4">Phone</th>
 <th className="text-left py-3 px-4">Vehicle</th>
 <th className="text-left py-3 px-4">Status</th>
 <th className="text-left py-3 px-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
 {persons.map((p) => (
 <tr key={p.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4 font-medium">{p.name}</td>
 <td className="py-3 px-4 text-xs">{p.phone || '-'}</td>
 <td className="py-3 px-4 text-xs">{p.vehicle_number || '-'}</td>
 <td className="py-3 px-4">
 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-100 text-green-700 ' : 'bg-gray-100 text-gray-600'}`}>{p.status || 'Active'}</span>
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-1">
 <button onClick={() => openEdit(p)} className="p-1 hover:bg-gray-100 :bg-gray-800 rounded"><Edit2 size={14} className="text-gray-400 " /></button>
 <button onClick={() => remove(p.id!)} className="p-1 hover:bg-red-50 :bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
 </div>
 </td>
 </tr>
 ))}
 {persons.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-400 ">No delivery persons added yet</td></tr>}
 </tbody>
 </table>
 </div>
 </div>

 <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Delivery Person' : 'Add Delivery Person'}>
 <div className="space-y-3">
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
 <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
 <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Number</label>
 <input value={form.vehicle_number || ''} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div className="flex justify-end gap-2 pt-2">
 <button onClick={() => setModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 :bg-gray-800">Cancel</button>
 <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
 </div>
 </div>
 </Modal>
 </div>
 );
}
