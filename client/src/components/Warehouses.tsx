import { useEffect, useState } from 'react';
import { api } from '../api';
import { Warehouse } from '../types';
import { Plus, Edit2, Trash2, Warehouse as WarehouseIcon } from 'lucide-react';
import Modal from './Modal';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<Warehouse>({
    name: '', address: '', city: '', contact_person: '', phone: '', email: '',
  });

  const load = () => api.warehouses.list().then(setWarehouses);

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEdit(null);
    setForm({ name: '', code: '', address: '', city: '', contact_person: '', phone: '', email: '' });
    setModal(true);
  };

  const openEdit = (w: Warehouse) => { setEdit(w); setForm(w); setModal(true); };

  const save = async () => {
    if (edit?.id) await api.warehouses.update(edit.id, form);
    else await api.warehouses.create(form);
    setModal(false); load();
  };

  const remove = async (id: number) => {
    if (confirm('Delete this warehouse?')) { await api.warehouses.delete(id); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <WarehouseIcon className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Warehouses</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus size={16} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {warehouses.map((w) => (
          <div key={w.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{w.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">{w.city || 'No city'}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${w.status === 'Active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:text-gray-400'}`}>{w.status || 'Active'}</span>
                {w.code && <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">{w.code}</span>}
              </div>
            </div>
            {w.address && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{w.address}</p>}
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              {w.contact_person && <p>Contact: {w.contact_person}</p>}
              {w.phone && <p>Phone: {w.phone}</p>}
              {w.email && <p>Email: {w.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{w.total_bookings || 0}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Bookings</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{w.total_loadings || 0}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Loadings</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{w.total_receivings || 0}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Receivings</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{(w.total_shortage || 0).toFixed(1)}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Shortage</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{(w.total_nags_received || 0).toFixed(0)}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Nags Recv</p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{w.total_deliveries || 0}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Deliveries</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => openEdit(w)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => remove(w.id!)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {warehouses.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400 dark:text-gray-500">
            <WarehouseIcon size={40} className="mx-auto mb-3 text-gray-200" />
            <p>No warehouses added yet</p>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Warehouse' : 'Add Warehouse'}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Warehouse Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Mumbai Main Hub" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Warehouse Code *</label>
            <input value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., WH-MUM-01" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label>
            <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} placeholder="Full address" />
          </div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">City</label><input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select value={form.status || 'Active'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</label><input value={form.contact_person || ''} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label><input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label><input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
        </div>
      </Modal>
    </div>
  );
}
