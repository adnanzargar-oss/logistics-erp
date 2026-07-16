import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api';
import { Booking, Customer } from '../types';
import { Plus, Edit2, Trash2, BookOpen, Eye, Printer, X, Barcode } from 'lucide-react';
import Modal from './Modal';
import CustomerAutocomplete from './CustomerAutocomplete';
import { printLRR } from './PrintLRR';
import { printInvoice } from './PrintInvoice';
import { consumeDetailId } from '../hooks/useNavigate';

const COMPANY = {
 name: 'Planet Transport Pvt Ltd.',
 regdOffice: 'Tengpora, Byepass Srinagar-190010',
 deliveryAddress: 'Tengpora Bypass, Near New City Hospital',
 phone: '9419428505, 9906661400',
};

const emptyForm = (): Booking => ({
 booking_no: '', customer_id: undefined,
 pickup_location: '', delivery_location: '', pickup_date: '', delivery_date: '',
 lr_date: new Date().toISOString().slice(0, 10), from_location: '', to_location: '',
 consignor_name: '', consignor_address: '', consignor_gstin: '', consignor_contact: '',
 consignee_name: '', consignee_address: '', consignee_gstin: '', consignee_contact: '',
 consignee_delivery_address: '',
 num_bags: undefined, type_of_packing: '', said_to_contain: '',
 actual_weight: undefined, charged_weight: undefined, private_marka: '',
 material_invoice_no: '', material_invoice_date: '', material_invoice_amt: '',
 freight: 0, eway_bill_charges: 0, previous_freight: 0, door_delivery: 0,
 consignment_charges: 0, other_charges: 0, total_charges: 0, discount: 0, grand_total: 0,
 eway_bill_no: '', eway_expiry_date: '',
 material: '', weight_kg: undefined, distance_km: undefined,
 rate_type: 'Fixed', rate_amount: 0, total_amount: 0,
 status: 'Booked', invoice_no: '', notes: '', paid: 0, paid_by: '',
});

function calcCharges(c: Partial<Booking>): Partial<Booking> {
 const total = (c.freight ?? 0) + (c.eway_bill_charges ?? 0) + (c.previous_freight ?? 0)
 + (c.door_delivery ?? 0) + (c.consignment_charges ?? 0) + (c.other_charges ?? 0);
 return { total_charges: total, grand_total: total - (c.discount ?? 0) };
}

export default function Bookings({ tabs, actions }: { tabs?: string[] | null; actions?: string[] | null }) {
  const canCreate = !actions || actions.includes('create');
  const canEdit = !actions || actions.includes('edit');
  const canDelete = !actions || actions.includes('delete');
  const allowedTabs = tabs ? (['today', 'history'] as const).filter((t) => tabs.includes(t)) : ['today', 'history'];
  const defaultTab = allowedTabs[0] || 'today';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [tab, setTab] = useState<'today' | 'history'>(defaultTab);
  const [searchText, setSearchText] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterConsignor, setFilterConsignor] = useState('');
  const [filterConsignee, setFilterConsignee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<Booking | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Booking>(emptyForm());
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<any>(null);

  const startScanner = async () => {
    setScannerOpen(true);
    setTimeout(async () => {
      const el = document.getElementById('barcode-scanner-booking');
      if (!el) return;
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-scanner-booking');
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (text: string) => {
          stopScanner();
          setSearchText(text);
        },
        () => {}
      ).catch(() => {});
    }, 300);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScannerOpen(false);
  };

  const load = useCallback(() => Promise.all([
  api.bookings.list().then(setBookings),
  api.customers.list().then(setCustomers),
  ]), []);

 useEffect(() => { load(); }, [load]);

 useEffect(() => {
 const id = consumeDetailId();
 if (id) api.bookings.get(id).then(setDetail);
 }, []);

 const openCreate = () => { setEditId(null); setForm({ ...emptyForm(), lr_date: new Date().toISOString().slice(0, 10) }); setModal(true); };
 const openEdit = (b: Booking) => { setEditId(b.id ?? null); setForm(b); setModal(true); };

 const updateField = (field: string, value: any) => {
 const updated = { ...form, [field]: value };
 if (['freight', 'eway_bill_charges', 'previous_freight', 'door_delivery', 'consignment_charges', 'other_charges', 'discount'].includes(field)) {
 const charges = calcCharges(updated);
 Object.assign(updated, charges);
 }
 setForm(updated);
 };

 const onConsignorSelect = (c: Customer) => {
 setForm((f) => ({ ...f, consignor_address: c.address || f.consignor_address, consignor_gstin: c.gstin || f.consignor_gstin, consignor_contact: c.phone || f.consignor_contact }));
 };
 const onConsigneeSelect = (c: Customer) => {
 setForm((f) => ({ ...f, consignee_address: c.address || f.consignee_address, consignee_gstin: c.gstin || f.consignee_gstin, consignee_contact: c.phone || f.consignee_contact }));
 };

 const save = async () => {
 if (editId) await api.bookings.update(editId, form);
 else await api.bookings.create(form);
 setModal(false); load();
 };

 const remove = async (id: number) => {
 if (confirm('Delete this booking?')) { await api.bookings.delete(id); load(); }
 };

  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.lr_date === today || b.created_at?.startsWith(today));
  const historyBookings = bookings.filter((b) => b.lr_date !== today && !b.created_at?.startsWith(today));

  const activeFilters: { label: string; onClear: () => void }[] = [];
  if (filterDateFrom) activeFilters.push({ label: `From: ${filterDateFrom}`, onClear: () => setFilterDateFrom('') });
  if (filterDateTo) activeFilters.push({ label: `To: ${filterDateTo}`, onClear: () => setFilterDateTo('') });
  if (filterConsignor) activeFilters.push({ label: `Consignor: ${filterConsignor}`, onClear: () => setFilterConsignor('') });
  if (filterConsignee) activeFilters.push({ label: `Consignee: ${filterConsignee}`, onClear: () => setFilterConsignee('') });
  if (filterStatus) activeFilters.push({ label: `Status: ${filterStatus}`, onClear: () => setFilterStatus('') });

  const q = searchText.toLowerCase();
  const source = tab === 'today' ? todayBookings : historyBookings;
  const filteredBookings = source.filter((b) => {
    if (!q || b.booking_no?.toLowerCase().includes(q) ||
      b.consignor_name?.toLowerCase().includes(q) ||
      b.consignee_name?.toLowerCase().includes(q) ||
      b.from_location?.toLowerCase().includes(q) ||
      b.to_location?.toLowerCase().includes(q) ||
      b.vehicle_reg?.toLowerCase().includes(q)) {
      // passes search text
    } else return false;
    if (filterDateFrom && (b.lr_date || '') < filterDateFrom) return false;
    if (filterDateTo && (b.lr_date || '') > filterDateTo) return false;
    if (filterConsignor && !b.consignor_name?.toLowerCase().includes(filterConsignor.toLowerCase())) return false;
    if (filterConsignee && !b.consignee_name?.toLowerCase().includes(filterConsignee.toLowerCase())) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
 Booked: 'bg-blue-100 text-blue-700 ', 'In Progress': 'bg-amber-100 text-amber-700 ',
 Completed: 'bg-green-100 text-green-700 ', Pending: 'bg-purple-100 text-purple-700 ',
 Cancelled: 'bg-red-100 text-red-700 ',
 };

  return (
  <div>
  <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
  <BookOpen className="text-indigo-600" size={24} />
  <h1 className="text-2xl font-bold text-gray-800 ">Bookings / LRR</h1>
  </div>
  {canCreate && (
    <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
    <Plus size={16} /> New LRR
    </button>
  )}
  </div>

  {/* Tabs + Search + Filter Toggle */}
  <div className="flex flex-wrap items-center gap-2 mb-3">
  <div className="flex bg-gray-100 rounded-lg p-0.5">
  {allowedTabs.includes('today') && (
    <button onClick={() => { setTab('today'); setSearchText(''); }}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${tab === 'today' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
      Today {todayBookings.length > 0 && <span className="ml-1 text-xs text-gray-400">({todayBookings.length})</span>}
    </button>
  )}
  {allowedTabs.includes('history') && (
    <button onClick={() => { setTab('history'); setSearchText(''); }}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${tab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
      History
    </button>
  )}
  </div>
  <div className="flex-1 flex items-center gap-2 min-w-0">
  <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
    placeholder="Search LRR, consignor, consignee..."
    className="flex-1 min-w-0 max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 bg-white text-gray-800 placeholder:text-gray-400" />
  <button onClick={startScanner} className="p-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50" title="Scan barcode"><Barcode size={16} /></button>
  </div>
  </div>

  {/* Filter Panel - History only */}
  {tab === 'history' && <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
  <div>
  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Date From</label>
  <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
    className="w-full border rounded px-2 py-1.5 text-xs outline-none focus:border-gray-400" />
  </div>
  <div>
  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Date To</label>
  <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
    className="w-full border rounded px-2 py-1.5 text-xs outline-none focus:border-gray-400" />
  </div>
  <div>
  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Consignor</label>
  <input value={filterConsignor} onChange={(e) => setFilterConsignor(e.target.value)} placeholder="Name..."
    className="w-full border rounded px-2 py-1.5 text-xs outline-none focus:border-gray-400 placeholder:text-gray-300" />
  </div>
  <div>
  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Consignee</label>
  <input value={filterConsignee} onChange={(e) => setFilterConsignee(e.target.value)} placeholder="Name..."
    className="w-full border rounded px-2 py-1.5 text-xs outline-none focus:border-gray-400 placeholder:text-gray-300" />
  </div>
  <div>
  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Status</label>
  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
    className="w-full border rounded px-2 py-1.5 text-xs outline-none focus:border-gray-400 bg-white">
  <option value="">All</option>
  <option>Booked</option><option>In Progress</option><option>Completed</option><option>Pending</option><option>Cancelled</option>
  </select>
  </div>
  </div>
  {activeFilters.length > 0 && (
  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
  <span className="text-[10px] text-gray-400 font-medium mr-1">Active:</span>
  {activeFilters.map((f, i) => (
    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-medium">
    {f.label}
    <button onClick={f.onClear} className="hover:text-indigo-900"><X size={12} /></button>
    </span>
  ))}
  <button onClick={() => { setFilterDateFrom(''); setFilterDateTo(''); setFilterConsignor(''); setFilterConsignee(''); setFilterStatus(''); }}
    className="text-[10px] text-gray-400 hover:text-red-500 ml-1 font-medium">Clear all</button>
  </div>
  )}
  </div>}

  {/* Table */}
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
  <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr>
 <th className="text-left py-3 px-4">LR #</th>
 <th className="text-left py-3 px-4">Date</th>
 <th className="text-left py-3 px-4">Consignor</th>
 <th className="text-left py-3 px-4">Consignee</th>
 <th className="text-left py-3 px-4">From → To</th>
 <th className="text-left py-3 px-4">Vehicle</th>
 <th className="text-left py-3 px-4">Grand Total</th>
 <th className="text-left py-3 px-4">Status</th>
 <th className="text-left py-3 px-4">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
  {filteredBookings.map((b) => (
 <tr key={b.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4 font-mono text-xs font-medium">{b.booking_no}</td>
 <td className="py-3 px-4 text-xs">{b.lr_date ? new Date(b.lr_date).toLocaleDateString() : '-'}</td>
 <td className="py-3 px-4 max-w-[140px] truncate text-xs">{b.consignor_name || '-'}</td>
 <td className="py-3 px-4 max-w-[140px] truncate text-xs">{b.consignee_name || '-'}</td>
 <td className="py-3 px-4 text-xs">{b.from_location || '-'} → {b.to_location || '-'}</td>
 <td className="py-3 px-4 text-xs">{b.vehicle_reg || '-'}</td>
 <td className="py-3 px-4 font-medium">{(b.grand_total ?? 0).toLocaleString()}</td>
 <td className="py-3 px-4">
 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status || 'Booked']}`}>{b.status}</span>
 </td>
 <td className="py-3 px-4">
 <div className="flex gap-1">
 <button onClick={() => setDetail(b)} className="p-1 hover:bg-gray-100 :bg-gray-800 rounded" title="View"><Eye size={14} className="text-gray-400 " /></button>
  {canEdit && <button onClick={() => openEdit(b)} className="p-1 hover:bg-gray-100 :bg-gray-800 rounded" title="Edit"><Edit2 size={14} className="text-gray-400 " /></button>}
  <button onClick={() => printLRR(b)} className="p-1 hover:bg-blue-50 rounded" title="Print"><Printer size={14} className="text-blue-400" /></button>
  {canDelete && <button onClick={() => remove(b.id!)} className="p-1 hover:bg-red-50 :bg-red-900/20 rounded" title="Delete"><Trash2 size={14} className="text-red-400" /></button>}
 </div>
 </td>
 </tr>
 ))}
  {filteredBookings.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400 ">No bookings found</td></tr>}
 </tbody>
 </table>
 </div>
 </div>

 {/* Create/Edit Modal */}
 <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit LRR' : 'New LRR / Consignment Note'} wide>
 <div className="space-y-5 text-sm">
 {/* LR Date, From, To */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 <div><label className="block text-xs font-medium text-gray-500 mb-1">LR Date</label>
 <input type="date" value={form.lr_date || ''} onChange={(e) => updateField('lr_date', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">From</label>
 <select value={form.from_location || ''} onChange={(e) => updateField('from_location', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
 <option value="">Select</option>
 <option>Delhi</option>
 <option>Srinagar</option>
 <option>Agra</option>
 <option>Panipat</option>
 <option>Amritsar</option>
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">To</label>
 <select value={form.to_location || ''} onChange={(e) => updateField('to_location', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
 <option value="">Select</option>
 <option>Delhi</option>
 <option>Srinagar</option>
 <option>Agra</option>
 <option>Panipat</option>
 <option>Amritsar</option>
 </select></div>

 </div>

 {/* Consignor & Consignee */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="border rounded-lg p-3 bg-blue-50/30 ">
 <h3 className="font-semibold text-blue-800 text-xs uppercase mb-2">Consignor (Sender)</h3>
 <div className="space-y-2">
 <CustomerAutocomplete customers={customers} value={form.consignor_name || ''} onChange={(v) => updateField('consignor_name', v)} onSelect={onConsignorSelect} placeholder="Name" />
 <textarea value={form.consignor_address || ''} onChange={(e) => updateField('consignor_address', e.target.value)} placeholder="Address" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} />
 <div className="grid grid-cols-2 gap-2">
 <input value={form.consignor_gstin || ''} onChange={(e) => updateField('consignor_gstin', e.target.value.toUpperCase())} placeholder="GSTIN No" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 <input value={form.consignor_contact || ''} onChange={(e) => updateField('consignor_contact', e.target.value)} placeholder="Contact" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 </div>
 </div>
 <div className="border rounded-lg p-3 bg-green-50/30 ">
 <h3 className="font-semibold text-green-800 text-xs uppercase mb-2">Consignee (Receiver)</h3>
 <div className="space-y-2">
 <CustomerAutocomplete customers={customers} value={form.consignee_name || ''} onChange={(v) => updateField('consignee_name', v)} onSelect={onConsigneeSelect} placeholder="Name" />
 <textarea value={form.consignee_address || ''} onChange={(e) => updateField('consignee_address', e.target.value)} placeholder="Address" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} />
 <div className="grid grid-cols-2 gap-2">
 <input value={form.consignee_gstin || ''} onChange={(e) => updateField('consignee_gstin', e.target.value.toUpperCase())} placeholder="GSTIN No" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 <input value={form.consignee_contact || ''} onChange={(e) => updateField('consignee_contact', e.target.value)} placeholder="Contact" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <textarea value={form.consignee_delivery_address || ''} onChange={(e) => updateField('consignee_delivery_address', e.target.value)} placeholder="Delivery Address" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" rows={1} />
 </div>
 </div>
 </div>

 {/* Material Information */}
 <div className="border rounded-lg p-3">
 <h3 className="font-semibold text-gray-700 text-xs uppercase mb-2">Material Information</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 <div><label className="block text-[10px] text-gray-400 ">No. of Nags</label>
 <input type="number" value={form.num_bags ?? ''} onChange={(e) => updateField('num_bags', e.target.value ? Number(e.target.value) : undefined)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">Type of Packing</label>
 <input value={form.type_of_packing || ''} onChange={(e) => updateField('type_of_packing', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div className="md:col-span-2"><label className="block text-[10px] text-gray-400 ">Said to Contain</label>
 <input value={form.said_to_contain || ''} onChange={(e) => updateField('said_to_contain', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">Actual Weight (kg)</label>
 <input type="number" value={form.actual_weight ?? ''} onChange={(e) => updateField('actual_weight', e.target.value ? Number(e.target.value) : undefined)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">Charged Weight (kg)</label>
 <input type="number" value={form.charged_weight ?? ''} onChange={(e) => updateField('charged_weight', e.target.value ? Number(e.target.value) : undefined)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div className="md:col-span-2"><label className="block text-[10px] text-gray-400 ">Private Marka</label>
 <input value={form.private_marka || ''} onChange={(e) => updateField('private_marka', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 </div>
 <div className="border-t mt-2 pt-2">
 <h4 className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Material Invoice</h4>
 <div className="grid grid-cols-3 gap-2">
 <input value={form.material_invoice_no || ''} onChange={(e) => updateField('material_invoice_no', e.target.value)} placeholder="Invoice No" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 <input type="date" value={form.material_invoice_date || ''} onChange={(e) => updateField('material_invoice_date', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 <input type="number" value={form.material_invoice_amt ?? ''} onChange={(e) => updateField('material_invoice_amt', e.target.value === '' ? undefined : Number(e.target.value))} placeholder="Invoice Amount" className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 </div>
 </div>

 {/* Charges */}
 <div className="border rounded-lg p-3">
 <h3 className="font-semibold text-gray-700 text-xs uppercase mb-2">Charges (To Pay)</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 <div><label className="block text-[10px] text-gray-400 ">Freight</label>
 <input type="number" value={form.freight ?? ''} onChange={(e) => updateField('freight', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">E-Way Bill Charges</label>
 <input type="number" value={form.eway_bill_charges ?? ''} onChange={(e) => updateField('eway_bill_charges', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">Previous Freight</label>
 <input type="number" value={form.previous_freight ?? ''} onChange={(e) => updateField('previous_freight', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">Door Delivery</label>
 <input type="number" value={form.door_delivery ?? ''} onChange={(e) => updateField('door_delivery', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">Consignment Charges</label>
 <input type="number" value={form.consignment_charges ?? ''} onChange={(e) => updateField('consignment_charges', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-[10px] text-gray-400 ">Other Charges</label>
 <input type="number" value={form.other_charges ?? ''} onChange={(e) => updateField('other_charges', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div className="border-t pt-1"><label className="block text-[10px] font-semibold text-gray-600 ">Total</label>
 <input type="number" value={form.total_charges ?? ''} readOnly className="w-full border rounded px-2 py-1.5 text-xs bg-gray-50 font-bold" /></div>
 <div className="border-t pt-1"><label className="block text-[10px] text-gray-400 ">Discount</label>
 <input type="number" value={form.discount ?? ''} onChange={(e) => updateField('discount', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 </div>
 <div className="mt-2 text-right flex items-center justify-end gap-4">
 <div className="flex items-center gap-2">
 <span className={`text-xs font-medium ${form.paid ? 'text-green-600' : 'text-amber-600'}`}>
 {form.paid ? 'Paid' : 'To Be Paid'}
 </span>
 <button
 onClick={() => setForm({ ...form, paid: form.paid ? 0 : 1 } as Booking)}
 className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.paid ? 'bg-green-500' : 'bg-gray-300 '}`}
 >
 <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.paid ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
 </button>
 <div className="flex gap-1.5 ml-2">
 <button
 onClick={() => setForm({ ...form, paid_by: 'consignor' } as Booking)}
 className={`px-2 py-0.5 text-[10px] rounded font-medium border ${form.paid_by === 'consignor' ? 'bg-indigo-100 border-indigo-300 text-indigo-700 ' : 'border-gray-300 text-gray-500 '}`}
 >Consignor</button>
 <button
 onClick={() => setForm({ ...form, paid_by: 'consignee' } as Booking)}
 className={`px-2 py-0.5 text-[10px] rounded font-medium border ${form.paid_by === 'consignee' ? 'bg-indigo-100 border-indigo-300 text-indigo-700 ' : 'border-gray-300 text-gray-500 '}`}
 >Consignee</button>
 </div>
 </div>
 <span className="text-xs text-gray-500 ">Grand Total: </span>
 <span className="text-lg font-bold text-indigo-700">{(form.grand_total ?? 0).toLocaleString()}</span>
 </div>
 </div>

 {/* E-Way Bill */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">E-Way Bill No</label>
 <input value={form.eway_bill_no || ''} onChange={(e) => updateField('eway_bill_no', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">E-Way Expiry Date</label>
 <input type="date" value={form.eway_expiry_date || ''} onChange={(e) => updateField('eway_expiry_date', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
 <select value={form.status || 'Booked'} onChange={(e) => updateField('status', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>Booked</option><option>In Progress</option><option>Completed</option><option>Pending</option><option>Cancelled</option>
 </select>
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
 <textarea value={form.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} />
 </div>
 </div>

 <div className="flex justify-end gap-3 mt-6 pt-3 border-t">
 <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 :bg-gray-800 rounded-lg">Cancel</button>
 <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save LRR</button>
 </div>
 </Modal>

 {/* Detail Modal */}
 <Modal open={!!detail} onClose={() => setDetail(null)} title={`LRR: ${detail?.booking_no || ''}`} wide>
 {detail && <LRRDetailView booking={detail} />}
  </Modal>

  <Modal open={scannerOpen} onClose={stopScanner} title="Scan Barcode">
    <div className="flex flex-col items-center gap-3">
      <div id="barcode-scanner-booking" className="w-full max-w-sm aspect-[3/2] bg-gray-900 rounded-lg overflow-hidden" />
      <p className="text-xs text-gray-500">Point camera at the barcode on the LRR</p>
      <button onClick={stopScanner} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Cancel</button>
    </div>
  </Modal>
  </div>
  );
}

function LRRDetailView({ booking }: { booking: Booking }) {
 return (
 <div className="space-y-4 text-sm">
 <div className="text-center border-b pb-2">
 <h3 className="font-bold">{COMPANY.name}</h3>
 <p className="text-xs text-gray-500 ">{COMPANY.regdOffice} | {COMPANY.phone}</p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
 <div><span className="text-gray-400 ">LR No:</span> <span className="font-medium">{booking.booking_no}</span></div>
 <div><span className="text-gray-400 ">Date:</span> {booking.lr_date ? new Date(booking.lr_date).toLocaleDateString() : '-'}</div>
 <div><span className="text-gray-400 ">From:</span> {booking.from_location || '-'}</div>
 <div><span className="text-gray-400 ">To:</span> {booking.to_location || '-'}</div>
 <div><span className="text-gray-400 ">Vehicle:</span> {booking.vehicle_reg || '-'}</div>
 <div><span className="text-gray-400 ">Driver:</span> {booking.driver_name || '-'}</div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="border rounded p-2 bg-blue-50/30 ">
 <h4 className="font-semibold text-xs text-blue-800">Consignor</h4>
 <p className="text-xs">{booking.consignor_name || '-'}</p>
 <p className="text-[10px] text-gray-500 ">{booking.consignor_address}</p>
 <p className="text-[10px]">GST: {booking.consignor_gstin || '-'} | {booking.consignor_contact || ''}</p>
 </div>
 <div className="border rounded p-2 bg-green-50/30 ">
 <h4 className="font-semibold text-xs text-green-800">Consignee</h4>
 <p className="text-xs">{booking.consignee_name || '-'}</p>
 <p className="text-[10px] text-gray-500 ">{booking.consignee_address}</p>
 <p className="text-[10px]">GST: {booking.consignee_gstin || '-'} | {booking.consignee_contact || ''}</p>
 {booking.consignee_delivery_address && <p className="text-[10px]">Deliver to: {booking.consignee_delivery_address}</p>}
 </div>
 </div>

 <div className="border rounded p-2">
 <h4 className="font-semibold text-xs mb-1">Material</h4>
 <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
 <div>Nags: {booking.num_bags ?? '-'}</div>
 <div>Packing: {booking.type_of_packing || '-'}</div>
 <div className="md:col-span-2">Contain: {booking.said_to_contain || '-'}</div>
 <div>Actual: {booking.actual_weight ? `${booking.actual_weight} kg` : '-'}</div>
 <div>Charged: {booking.charged_weight ? `${booking.charged_weight} kg` : '-'}</div>
 <div className="md:col-span-3">Marka: {booking.private_marka || '-'}</div>
 <div className="md:col-span-3">Invoice: {booking.material_invoice_no || '-'} {booking.material_invoice_date ? `(${new Date(booking.material_invoice_date).toLocaleDateString()})` : ''} Amt: {(booking.material_invoice_amt ?? 0).toLocaleString()}</div>
 </div>
 </div>

 <div className="border rounded p-2">
 <h4 className="font-semibold text-xs mb-1">Charges</h4>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-[10px]">
 <div>Freight: {(booking.freight ?? 0).toLocaleString()}</div>
 <div>E-Way: {(booking.eway_bill_charges ?? 0).toLocaleString()}</div>
 <div>Prev Freight: {(booking.previous_freight ?? 0).toLocaleString()}</div>
 <div>Door Delivery: {(booking.door_delivery ?? 0).toLocaleString()}</div>
 <div>Consignment: {(booking.consignment_charges ?? 0).toLocaleString()}</div>
 <div>Other: {(booking.other_charges ?? 0).toLocaleString()}</div>
 <div className="border-t pt-0.5 font-semibold">Total: {(booking.total_charges ?? 0).toLocaleString()}</div>
 <div className="border-t pt-0.5">Discount: {(booking.discount ?? 0).toLocaleString()}</div>
 </div>
 <div className="text-right mt-1">
 <span className="font-bold text-indigo-700">Grand Total: {(booking.grand_total ?? 0).toLocaleString()}</span>
 </div>
 </div>

 {booking.eway_bill_no && (
 <div className="text-xs">
 <span className="text-gray-400 ">E-Way Bill:</span> {booking.eway_bill_no}
 {booking.eway_expiry_date && <> | Expiry: {new Date(booking.eway_expiry_date).toLocaleDateString()}</>}
 </div>
 )}

 <div className="flex items-center justify-center gap-2 text-xs">
 <span className="text-gray-500">Payment:</span>
 <span className={`font-semibold px-2 py-0.5 rounded ${booking.paid ? 'bg-green-100 text-green-700 ' : 'bg-amber-100 text-amber-700 '}`}>
 {booking.paid ? 'Paid' : 'To Be Paid'}
 </span>
 {booking.paid && booking.paid_by && (
 <span className="text-gray-400 ml-1">(by {booking.paid_by === 'consignee' ? 'Consignee' : 'Consignor'})</span>
 )}
 </div>

 <div className="flex justify-center gap-3 pt-2 border-t">
 <button onClick={() => printLRR(booking)} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
 <Printer size={16} /> Print LRR
 </button>
 <button onClick={() => printInvoice(booking)} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
 <Printer size={16} /> Print Invoice
 </button>
 </div>
 </div>
 );
}
