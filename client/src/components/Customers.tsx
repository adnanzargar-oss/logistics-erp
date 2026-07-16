import { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { Customer } from '../types';
import { Plus, Edit2, Building2, Phone, Mail, ChevronDown, Check, X } from 'lucide-react';
import Modal from './Modal';

const CUSTOMER_TYPES = ['Corporate', 'Individual', 'Government', 'Distributor', 'Manufacturer', 'Retailer', 'E-commerce'];
const CUSTOMER_STATUSES = ['Active', 'Inactive', 'Blacklisted', 'Suspended'];
const ALL_TAGS = ['VIP', 'Premium', 'High Volume', 'Export', 'Import', 'E-commerce', 'Cash Customer', 'Credit Customer', 'Furniture', 'Pharma', 'Fragile Cargo', 'Temperature Controlled', 'High Priority'];

const statusColors: Record<string, string> = {
 Active: 'bg-green-100 text-green-700 ',
 Inactive: 'bg-gray-100 text-gray-500 ',
 Blacklisted: 'bg-red-100 text-red-700 ',
 Suspended: 'bg-amber-100 text-amber-700 ',
};

const typeColors: Record<string, string> = {
 Corporate: 'bg-blue-100 text-blue-700 ',
 Individual: 'bg-gray-100 text-gray-600 ',
 Government: 'bg-purple-100 text-purple-700 ',
 Distributor: 'bg-cyan-100 text-cyan-700 ',
 Manufacturer: 'bg-orange-100 text-orange-700 ',
 Retailer: 'bg-pink-100 text-pink-700 ',
 'E-commerce': 'bg-teal-100 text-teal-700 ',
};

const tagColors = [
 'bg-indigo-100 text-indigo-700 ',
 'bg-emerald-100 text-emerald-700 ',
 'bg-rose-100 text-rose-700 ',
 'bg-amber-100 text-amber-700 ',
 'bg-violet-100 text-violet-700 ',
 'bg-sky-100 text-sky-700 ',
 'bg-lime-100 text-lime-700 ',
];

export default function Customers() {
 const [customers, setCustomers] = useState<Customer[]>([]);
 const [filterType, setFilterType] = useState<string[]>([]);
 const [filterStatus, setFilterStatus] = useState<string[]>([]);
 const [filterTag, setFilterTag] = useState<string[]>([]);
 const [searchText, setSearchText] = useState('');
 const [openDropdown, setOpenDropdown] = useState<string | null>(null);
 const [tagInput, setTagInput] = useState('');
 const [modal, setModal] = useState(false);
 const [edit, setEdit] = useState<Customer | null>(null);
 const [form, setForm] = useState<Customer>({
 name: '', company: '', phone: '', email: '', address: '', gstin: '',
 customer_type: 'Individual', account_manager: '', tags: [],
 });

 const load = () => api.customers.list().then((data) => setCustomers(data.map((c: any) => ({ ...c, tags: typeof c.tags === 'string' ? JSON.parse(c.tags) : (c.tags || []) }))));

 useEffect(() => { load(); }, []);

 const filtered = customers.filter((c) => {
 if (filterType.length && !filterType.includes(c.customer_type || '')) return false;
 if (filterStatus.length && !filterStatus.includes(c.status || '')) return false;
 if (filterTag.length && !filterTag.some((t) => c.tags?.includes(t))) return false;
 if (searchText && !c.name.toLowerCase().includes(searchText.toLowerCase()) && !c.company?.toLowerCase().includes(searchText.toLowerCase()) && !c.phone?.includes(searchText)) return false;
 return true;
 });

 const hasFilters = filterType.length || filterStatus.length || filterTag.length || searchText;

 const toggleFilter = (arr: string[], set: (v: string[]) => void, val: string) =>
 set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClick = (e: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
 setOpenDropdown(null);
 }
 };
 document.addEventListener('mousedown', handleClick);
 return () => document.removeEventListener('mousedown', handleClick);
 }, []);

 const openCreate = () => {
 setEdit(null);
 setForm({ name: '', company: '', phone: '', email: '', address: '', gstin: '', customer_type: 'Individual', account_manager: '', tags: [] });
 setModal(true);
 };

 const save = async () => {
 if (edit?.id) await api.customers.update(edit.id, form);
 else await api.customers.create(form);
 setModal(false); load();
 };

 const toggleTag = (tag: string) => {
 setForm((f) => ({
 ...f,
 tags: f.tags?.includes(tag) ? f.tags.filter((t) => t !== tag) : [...(f.tags || []), tag],
 }));
 };

 const addCustomTag = () => {
 const t = tagInput.trim();
 if (t && !form.tags?.includes(t)) {
 setForm((f) => ({ ...f, tags: [...(f.tags || []), t] }));
 }
 setTagInput('');
 };

 const handleTagKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); }
 };

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Building2 className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Customers</h1>
 <span className="text-xs text-gray-400 ml-1">({filtered.length}{hasFilters && customers.length !== filtered.length ? ` / ${customers.length}` : ''})</span>
 </div>
 <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Add Customer
 </button>
 </div>

 {/* ─── Filter Pills ───────────────────────────────────────────────── */}
 <div className="mb-5 flex flex-wrap items-center gap-2" ref={dropdownRef}>
 <div className="relative">
 <button onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
 filterType.length
 ? 'bg-indigo-100 text-indigo-700 border-indigo-300 '
 : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
 }`}>
 Type {filterType.length > 0 && <span className="bg-indigo-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{filterType.length}</span>} <ChevronDown size={12} />
 </button>
 {openDropdown === 'type' && (
 <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2 space-y-0.5">
 {CUSTOMER_TYPES.map((t) => (
 <button key={t} onClick={() => toggleFilter(filterType, setFilterType, t)}
 className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
 filterType.includes(t) ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-600 hover:bg-gray-50 :bg-gray-800'
 }`}>
 <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${filterType.includes(t) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 '}`}>
 {filterType.includes(t) && <Check size={10} className="text-white" />}
 </div>
 {t}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="relative">
 <button onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
 filterStatus.length
 ? 'bg-indigo-100 text-indigo-700 border-indigo-300 '
 : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
 }`}>
 Status {filterStatus.length > 0 && <span className="bg-indigo-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{filterStatus.length}</span>} <ChevronDown size={12} />
 </button>
 {openDropdown === 'status' && (
 <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2 space-y-0.5">
 {CUSTOMER_STATUSES.map((s) => (
 <button key={s} onClick={() => toggleFilter(filterStatus, setFilterStatus, s)}
 className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
 filterStatus.includes(s) ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-600 hover:bg-gray-50 :bg-gray-800'
 }`}>
 <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${filterStatus.includes(s) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 '}`}>
 {filterStatus.includes(s) && <Check size={10} className="text-white" />}
 </div>
 {s}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="relative">
 <button onClick={() => setOpenDropdown(openDropdown === 'tags' ? null : 'tags')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
 filterTag.length
 ? 'bg-indigo-100 text-indigo-700 border-indigo-300 '
 : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
 }`}>
 Tags {filterTag.length > 0 && <span className="bg-indigo-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{filterTag.length}</span>} <ChevronDown size={12} />
 </button>
 {openDropdown === 'tags' && (
 <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2 space-y-0.5 max-h-60 overflow-y-auto">
 {ALL_TAGS.map((tag) => (
 <button key={tag} onClick={() => toggleFilter(filterTag, setFilterTag, tag)}
 className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
 filterTag.includes(tag) ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-600 hover:bg-gray-50 :bg-gray-800'
 }`}>
 <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${filterTag.includes(tag) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 '}`}>
 {filterTag.includes(tag) && <Check size={10} className="text-white" />}
 </div>
 {tag}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="relative flex-1 min-w-[200px] max-w-[280px]">
 <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search name, company, phone..."
 className="w-full px-3 py-1.5 rounded-full text-xs border border-gray-200 bg-white text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" />
 {searchText && <button onClick={() => setSearchText('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
 </div>

 {hasFilters && <button onClick={() => { setFilterType([]); setFilterStatus([]); setFilterTag([]); setSearchText(''); }} className="text-[11px] text-gray-400 hover:text-red-500">Clear all</button>}
 </div>

 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr>
 <th className="text-left py-3 px-4">Customer</th>
 <th className="text-left py-3 px-4">Type</th>
 <th className="text-left py-3 px-4">Status</th>
 <th className="text-left py-3 px-4">Contact</th>
 <th className="text-left py-3 px-4">Tags</th>
 <th className="text-center py-3 px-3">Bkgs</th>
 <th className="text-center py-3 px-3">Nags</th>
 <th className="text-right py-3 px-4">Invoiced</th>
 <th className="text-center py-3 px-3"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
 {filtered.map((c) => (
 <tr key={c.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
 <Building2 size={14} className="text-indigo-600 " />
 </div>
 <div>
 <p className="font-medium text-gray-800 text-sm">{c.name}</p>
 {c.customer_no && <p className="text-[10px] font-mono text-indigo-500 ">{c.customer_no}</p>}
 </div>
 </div>
 </td>
 <td className="py-3 px-4">{c.customer_type && <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[c.customer_type] || ''}`}>{c.customer_type}</span>}</td>
 <td className="py-3 px-4">{c.status && <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[c.status] || statusColors.Active}`}>{c.status}</span>}</td>
 <td className="py-3 px-4 text-xs text-gray-500 ">
 {c.phone && <p className="flex items-center gap-1"><Phone size={10} />{c.phone}</p>}
 {c.email && <p className="flex items-center gap-1 truncate max-w-[180px]"><Mail size={10} />{c.email}</p>}
 </td>
 <td className="py-3 px-4">
 {c.tags && c.tags.length > 0 && (
 <div className="flex flex-wrap gap-0.5 max-w-[160px]">
 {c.tags.slice(0, 2).map((tag, i) => (
 <span key={tag} className={`px-1 py-0.5 rounded text-[8px] font-medium ${tagColors[i % tagColors.length]}`}>{tag}</span>
 ))}
 {c.tags.length > 2 && <span className="text-[9px] text-gray-400 ml-0.5">+{c.tags.length - 2}</span>}
 </div>
 )}
 </td>
 <td className="py-3 px-3 text-center text-sm font-medium text-gray-700 ">{c.total_bookings || 0}</td>
 <td className="py-3 px-3 text-center text-sm font-medium text-gray-700 ">{c.total_nags_received || 0}</td>
 <td className="py-3 px-4 text-right text-sm font-medium text-gray-700 ">{(c.total_invoiced || 0).toLocaleString()}</td>
 <td className="py-3 px-3 text-center">
 <button onClick={() => { setEdit(c); setForm({ ...c, tags: c.tags || [] }); setModal(true); }} className="p-1 hover:bg-gray-100 :bg-gray-800 rounded">
 <Edit2 size={14} className="text-gray-400 " />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {customers.length === 0 && (
 <div className="text-center py-16 text-gray-400 ">
 <Building2 size={40} className="mx-auto mb-3 text-gray-200 " />
 <p>No customers added yet</p>
 </div>
 )}
 {customers.length > 0 && filtered.length === 0 && (
 <div className="text-center py-16 text-gray-400 ">
 <p>No customers match your filters</p>
 <button onClick={() => { setFilterType([]); setFilterStatus([]); setFilterTag([]); setSearchText(''); }} className="text-indigo-500 hover:text-indigo-600 text-sm mt-2">Clear all filters</button>
 </div>
 )}
 </div>
 </div>

 <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Customer' : 'Add Customer'}>
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
 <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
 <input value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Customer Type</label>
 <select value={form.customer_type || 'Individual'} onChange={(e) => setForm({ ...form, customer_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
 <select value={form.status || 'Active'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 {CUSTOMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
 <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
 <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">GSTIN</label>
 <input value={form.gstin || ''} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Account Manager</label>
 <input value={form.account_manager || ''} onChange={(e) => setForm({ ...form, account_manager: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Person responsible" />
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
 <textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} />
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1.5">Tags</label>
 {form.tags && form.tags.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mb-2">
 {form.tags.map((tag) => (
 <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-700 border border-indigo-300 ">
 {tag}
 <button type="button" onClick={() => toggleTag(tag)} className="hover:text-indigo-900 :text-indigo-100"><X size={11} /></button>
 </span>
 ))}
 </div>
 )}
 <div className="flex gap-2 mb-2">
 <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
 className="flex-1 border rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-600 placeholder-gray-400"
 placeholder="Type custom tag and press Enter" />
 <button type="button" onClick={addCustomTag} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shrink-0">Add</button>
 </div>
 <div className="flex flex-wrap gap-1.5">
 {ALL_TAGS.map((tag) => (
 <button key={tag} type="button" onClick={() => toggleTag(tag)}
 className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
 form.tags?.includes(tag)
 ? 'bg-indigo-100 text-indigo-700 border-indigo-300 '
 : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300'
 }`}>
 {tag}
 </button>
 ))}
 </div>
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
