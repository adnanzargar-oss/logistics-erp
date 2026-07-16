import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Shield, ShieldOff, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { MODULES, SUBMODULES, ALL_ACTIONS, ModulePermissions, ModulePerm, Action } from '../permissions';

const defaultPerm = (): ModulePerm => ({ tabs: ['*'], actions: ['create', 'edit', 'delete'] });

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<{ username: string; password: string; role: string; allowed_modules: ModulePermissions }>({
    username: '', password: '', role: 'user', allowed_modules: {},
  });

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = () => {
    fetch('/api/auth/users', { headers })
      .then((r) => r.json())
      .then(setUsers);
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ username: '', password: '', role: 'user', allowed_modules: {} });
    setModal(true);
  };

  const openEdit = (u: any) => {
    setEditId(u.id);
    const raw = JSON.parse(u.allowed_modules || '{}');
    // Handle old formats
    let perms: ModulePermissions = {};
    if (Array.isArray(raw)) {
      for (const mod of raw) perms[mod] = { tabs: ['*'], actions: ['create', 'edit', 'delete'] };
    } else {
      const firstKey = Object.keys(raw)[0];
      if (firstKey && Array.isArray(raw[firstKey])) {
        for (const [mod, subs] of Object.entries(raw)) {
          perms[mod] = { tabs: subs as string[], actions: ['create', 'edit', 'delete'] };
        }
      } else {
        perms = raw;
      }
    }
    setForm({ username: u.username, password: '', role: u.role, allowed_modules: perms });
    setModal(true);
  };

  const toggleModule = (id: string) => {
    setForm((f) => {
      const next = { ...f.allowed_modules };
      if (id in next) {
        delete next[id];
      } else {
        const subs = SUBMODULES[id];
        next[id] = { tabs: subs ? subs.map((s) => s.id) : ['*'], actions: ['create', 'edit', 'delete'] };
      }
      return { ...f, allowed_modules: next };
    });
  };

  const toggleSubModule = (modId: string, subId: string) => {
    setForm((f) => {
      const next = { ...f.allowed_modules };
      const perm = { ...next[modId] };
      const subs = [...perm.tabs];
      const idx = subs.indexOf(subId);
      if (idx >= 0) subs.splice(idx, 1); else subs.push(subId);
      if (subs.length === 0) {
        delete next[modId];
      } else {
        next[modId] = { ...perm, tabs: subs };
      }
      return { ...f, allowed_modules: next };
    });
  };

  const toggleAction = (modId: string, action: Action) => {
    setForm((f) => {
      const next = { ...f.allowed_modules };
      const perm = { ...next[modId] };
      const acts = [...perm.actions];
      const idx = acts.indexOf(action);
      if (idx >= 0) acts.splice(idx, 1); else acts.push(action);
      next[modId] = { ...perm, actions: acts };
      return { ...f, allowed_modules: next };
    });
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

  const moduleLabel = (id: string) => MODULES.find((m) => m.id === id)?.label || id;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Users</h1>
        <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Username</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Allowed Modules</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const raw = JSON.parse(u.allowed_modules || '{}');
                let perms: ModulePermissions = {};
                if (!Array.isArray(raw) && typeof raw === 'object' && raw !== null) {
                  const fk = Object.keys(raw)[0];
                  if (fk && Array.isArray(raw[fk])) {
                    for (const [mod, subs] of Object.entries(raw)) perms[mod] = { tabs: subs as string[], actions: ['create', 'edit', 'delete'] };
                  } else {
                    perms = raw;
                  }
                }
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        {u.role === 'super_admin' ? <Shield size={14} className="text-amber-500" /> : <ShieldOff size={14} className="text-gray-400" />}
                        {u.username}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        u.role === 'super_admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.role === 'super_admin' ? (
                          <span className="text-[10px] text-gray-400 italic">All modules</span>
                        ) : (
                          Object.entries(perms).map(([modId, perm]) => (
                            <span key={modId} className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded" title={`Tabs: ${perm.tabs.includes('*') ? 'All' : perm.tabs.join(', ')}\nActions: ${perm.actions.join(', ')}`}>
                              {moduleLabel(modId)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'super_admin' && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => del(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Username *</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password {editId && '(leave blank to keep same)'}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800">
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {form.role !== 'super_admin' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Allowed Modules &amp; Sub-Modules &amp; Actions</label>
              <div className="space-y-1 max-h-80 overflow-y-auto border rounded-lg p-2">
                {MODULES.map((mod) => {
                  const checked = mod.id in form.allowed_modules;
                  const perm = form.allowed_modules[mod.id];
                  const subs = SUBMODULES[mod.id];
                  return (
                    <div key={mod.id}>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-1 px-1 rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModule(mod.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium">{mod.label}</span>
                      </label>
                      {checked && (
                        <div className="ml-6 pl-3 border-l-2 border-indigo-200 space-y-1 py-1">
                          {subs && subs.length > 0 && (
                            <div>
                              <div className="text-[10px] text-gray-400 font-medium mb-0.5">Tabs</div>
                              <div className="flex flex-wrap gap-1">
                                {subs.map((sub) => (
                                  <label key={sub.id} className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer py-0.5 px-1 rounded hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      checked={(perm?.tabs || []).includes(sub.id)}
                                      onChange={() => toggleSubModule(mod.id, sub.id)}
                                      className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                                    />
                                    {sub.label}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-[10px] text-gray-400 font-medium mb-0.5">Actions</div>
                            <div className="flex flex-wrap gap-1">
                              {ALL_ACTIONS.map((act) => (
                                <label key={act} className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer py-0.5 px-1 rounded hover:bg-gray-50 capitalize">
                                  <input
                                    type="checkbox"
                                    checked={(perm?.actions || []).includes(act)}
                                    onChange={() => toggleAction(mod.id, act)}
                                    className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                                  />
                                  {act}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={save} disabled={!form.username} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50">
              <Save size={14} /> {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
