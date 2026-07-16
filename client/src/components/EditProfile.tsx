import { useState } from 'react';
import { X } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

export default function EditProfile({ onClose }: { onClose: () => void }) {
  const token = localStorage.getItem('token');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setMsg(''); setErr('');
    if (!currentPassword && !username && !newPassword) {
      setErr('No changes to save');
      return;
    }
    if (newPassword && !currentPassword) {
      setErr('Current password required to set new password');
      return;
    }
    const body: Record<string, string> = {};
    if (username) body.username = username;
    if (currentPassword) body.current_password = currentPassword;
    if (newPassword) body.new_password = newPassword;
    const res = await fetch(`${BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json();
      setErr(d.error || 'Failed to update profile');
      return;
    }
    setMsg('Profile updated successfully');
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-3 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">New Username (leave blank to keep)</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="New username" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">New Password (leave blank to keep)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition-colors">Save</button>
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
