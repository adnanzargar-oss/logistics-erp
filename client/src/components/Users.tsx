import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Shield, ShieldOff, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '../AuthContext';

const allModules = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'customers', label: 'Customers' },
  { id: 'warehouses', label: 'Warehouses' },
  { id: 'loadings', label: 'Loading' },
  { id: 'receivings', label: 'Receiving' },
  { id: 'deliveries', label: 'Deliveries' },
  { id: 'fuel', label: 'Fuel Tracking' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'payments', label: 'Payments' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'reports', label: 'Reports' },
];

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'user', allowed_modules: [] as string[] });

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = () => {
    fetch('/api/auth/users', { headers })
      .then((r) => r.json())
      .then(setUsers);
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ username: '', password: '', role: 'user', allowed_modules: [] });
    setModal(true);
  };

  const openEdit = (u: any) => {
    setEditId(u.id);
    setForm({ username: u.username, password: '', role: u.role, allowed_modules: JSON.parse(u.allowed_modules || '[]') });
    setModal(true);
  };

  const toggleModule = (id: string) => {
    setForm((f) => ({
      ...f,
      allowed_modules: f.allowed_modules.includes(id) ? f.allowed_modules.filter((m) => m !== id) : [...f.allowed_modules, id],
    }));
  };

  const save = async () => {
    const url = editId ? `/api/auth/users/${editId}` : '/api/auth/users';
    const method = editId ? 'PUT' : 'POST';
    const body: any = { ...form };
    if (editId && !form.password) delete body.password;
    await fetch(url, { method, headers, body: JSON.stringify(body) });
    setModal(false);
    load();
  };

  const del = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/auth/users/${id}`, { method: 'DELETE', headers });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Users</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Username</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Allowed Modules</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-200">
                    <div className="flex items-center gap-2">
                      {u.role === 'super_admin' ? <Shield size={14} className="text-amber-500" /> : <ShieldOff size={14} className="text-gray-400" />}
                      {u.username}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      u.role === 'super_admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {u.role === 'super_admin' ? 'Super Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.role === 'super_admin' ? (
                        <span className="text-[10px] text-gray-400 italic">All modules</span>
                      ) : (
                        (JSON.parse(u.allowed_modules || '[]') as string[]).map((m) => (
                          <span key={m} className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                            {allModules.find((mod) => mod.id === m)?.label || m}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'super_admin' && (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"><Pencil size={14} /></button>
                        <button onClick={() => del(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit User' : 'Add User'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Username *</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password {editId && '(leave blank to keep same)'}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {form.role !== 'super_admin' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Allowed Modules</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {allModules.map((mod) => (
                  <label key={mod.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowed_modules.includes(mod.id)}
                      onChange={() => toggleModule(mod.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
            <button onClick={save} disabled={!form.username} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50">
              <Save size={14} /> {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
