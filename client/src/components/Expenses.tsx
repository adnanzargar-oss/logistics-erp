import { useEffect, useState } from 'react';
import { api } from '../api';
import { Expense, Vehicle } from '../types';
import { Plus, Trash2, Receipt, Printer, FileText, Pencil } from 'lucide-react';
import Modal from './Modal';
import { printPaymentVoucher } from './PrintPaymentVoucher';

const EXPENSE_TYPES = ['Office', 'Fuel', 'Travel', 'Utilities', 'Warehouse', 'Maintenance', 'Salary', 'Transport', 'Insurance', 'Legal', 'Marketing', 'Other'];
const EXPENSE_CATEGORIES = ['Fuel', 'Maintenance', 'Toll', 'Parking', 'Insurance', 'Permit', 'Salary', 'Driver Advance', 'Repair', 'Tire', 'Office Supplies', 'Rent', 'Electricity', 'Water', 'Internet', 'Travel', 'Entertainment', 'Legal Fees', 'Marketing', 'Other'];
const STATUSES = ['Draft', 'Pending Approval', 'Approved', 'Posted', 'Paid', 'Rejected', 'Cancelled'];
const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Partially Paid'];
const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'UPI', 'Online Transfer'];
const DEPARTMENTS = ['Finance', 'Operations', 'HR', 'Sales', 'Administration', 'IT', 'Warehouse', 'Management'];
const UNITS = ['Nos', 'Ltr', 'Kg', 'Box', 'Pack', 'Unit', 'Hour', 'Day', 'Month', 'Km'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];

const INIT_FORM: Expense = {
 expense_date: new Date().toISOString().slice(0, 10),
 posting_date: new Date().toISOString().slice(0, 10),
 expense_type: 'Office',
 expense_category: 'Fuel',
 status: 'Draft',
 branch: '',
 vehicle_id: undefined,
 warehouse_id: undefined,
 department: '',
 cost_center: '',
 project: '',
 vendor_name: '',
 vendor_code: '',
 vendor_type: '',
 contact_person: '',
 phone: '',
 vendor_email: '',
 vendor_address: '',
 trn_vat_number: '',
 expense_head: '',
 description: '',
 quantity: 1,
 unit: 'Nos',
 unit_cost: 0,
 amount: 0,
 tax_percentage: 0,
 tax_amount: 0,
 total_amount: 0,
 payment_status: 'Unpaid',
 payment_mode: 'Cash',
 bank_account: '',
 cheque_number: '',
 reference_no: '',
 payment_date: '',
 currency: 'INR',
 exchange_rate: 1,
 notes: '',
};

export default function Expenses() {
 const [expenses, setExpenses] = useState<any[]>([]);
 const [categories, setCategories] = useState<any[]>([]);
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [warehouses, setWarehouses] = useState<any[]>([]);
 const [modal, setModal] = useState(false);
 const [editId, setEditId] = useState<number | null>(null);
 const [form, setForm] = useState<Expense>({ ...INIT_FORM });
 const [filterCat, setFilterCat] = useState('');
 const [tab, setTab] = useState('basic');

 const load = () => Promise.all([
 api.expenses.list({ category: filterCat || undefined }).then(setExpenses),
 api.expenses.categories().then(setCategories),
 api.vehicles.list().then(setVehicles),
 fetch('/api/warehouses').then((r) => r.json()).then(setWarehouses),
 ]);

 useEffect(() => { load(); }, [filterCat]);

 const openCreate = async () => {
 setEditId(null);
 setForm({ ...INIT_FORM, expense_date: new Date().toISOString().slice(0, 10), posting_date: new Date().toISOString().slice(0, 10) });
 const res = await fetch('/api/expenses/next-no');
 const data = await res.json();
 setForm((f) => ({ ...f, voucher_no: data.voucher_no }));
 setTab('basic');
 setModal(true);
 };

 const openEdit = (e: any) => {
 setEditId(e.id);
 setForm({
 ...INIT_FORM,
 ...e,
 expense_date: e.expense_date?.slice(0, 10) || '',
 posting_date: e.posting_date?.slice(0, 10) || '',
 payment_date: e.payment_date?.slice(0, 10) || '',
 });
 setTab('basic');
 setModal(true);
 };

 const recalc = (f: Expense) => {
 const qty = f.quantity || 0;
 const unitCost = f.unit_cost || 0;
 const amt = f.amount || 0;
 const taxPct = f.tax_percentage || 0;
 const taxAmt = amt * (taxPct / 100);
 const total = amt + taxAmt;
 return { ...f, tax_amount: taxAmt, total_amount: total };
 };

 const save = async () => {
 const payload = recalc(form);
 try {
 if (editId) {
 await fetch(`/api/expenses/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
 } else {
 await api.expenses.create(payload);
 }
 setModal(false);
 load();
 } catch (err: any) {
 alert('Failed to save expense: ' + (err.message || 'Unknown error'));
 }
 };

 const remove = async (id: number) => {
 if (confirm('Delete this expense?')) { await api.expenses.delete(id); load(); }
 };

 const update = (partial: Partial<Expense>) => setForm((f) => ({ ...f, ...partial }));

 const summary = expenses.reduce((acc, e) => ({
 total: acc.total + (e.total_amount || e.amount || 0),
 count: acc.count + 1,
 paid: acc.paid + (e.payment_status === 'Paid' ? (e.total_amount || e.amount || 0) : 0),
 unpaid: acc.unpaid + (e.payment_status !== 'Paid' ? (e.total_amount || e.amount || 0) : 0),
 }), { total: 0, count: 0, paid: 0, unpaid: 0 });

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Receipt className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Expenses</h1>
 <span className="text-xs text-gray-400 ml-2">{summary.count} entries | {(summary.total).toLocaleString()} total</span>
 </div>
 <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Add Expense
 </button>
 </div>

 {/* Category summary */}
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
 {categories.map((c: any) => (
 <button key={c.expense_category} onClick={() => setFilterCat(filterCat === c.expense_category ? '' : c.expense_category)}
 className={`text-center rounded-xl p-3 border text-sm transition-all ${filterCat === c.expense_category ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
 <p className="font-medium text-xs">{c.expense_category}</p>
 <p className="font-bold">{c.total.toLocaleString()}</p>
 <p className="text-[10px] text-gray-400">{c.count} entries</p>
 </button>
 ))}
 </div>

 {/* Payments summary */}
 <div className="grid grid-cols-4 gap-3 mb-6">
 <div className="bg-white rounded-lg px-4 py-3 border border-gray-100 "><span className="text-[11px] text-gray-400">Total</span><p className="text-lg font-bold text-gray-800 ">{summary.total.toLocaleString()}</p></div>
 <div className="bg-white rounded-lg px-4 py-3 border border-gray-100 "><span className="text-[11px] text-gray-400">Paid</span><p className="text-lg font-bold text-green-600">{summary.paid.toLocaleString()}</p></div>
 <div className="bg-white rounded-lg px-4 py-3 border border-gray-100 "><span className="text-[11px] text-gray-400">Unpaid</span><p className="text-lg font-bold text-red-600">{summary.unpaid.toLocaleString()}</p></div>
 <div className="bg-white rounded-lg px-4 py-3 border border-gray-100 "><span className="text-[11px] text-gray-400">Entries</span><p className="text-lg font-bold text-gray-800 ">{summary.count}</p></div>
 </div>

 {/* Table */}
 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr>
 <th className="text-left py-3 px-4">Voucher</th>
 <th className="text-left py-3 px-4">Date</th>
 <th className="text-left py-3 px-4">Type</th>
 <th className="text-left py-3 px-4">Category</th>
 <th className="text-left py-3 px-4">Vendor</th>
 <th className="text-left py-3 px-4">Description</th>
 <th className="text-right py-3 px-4">Amount</th>
 <th className="text-left py-3 px-4">Status</th>
 <th className="text-left py-3 px-4">Payment</th>
 <th className="text-right py-3 px-4"></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
 {expenses.map((e: any) => (
 <tr key={e.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4 font-mono text-xs font-medium text-gray-800 ">{e.voucher_no || `#${e.id}`}</td>
 <td className="py-3 px-4 text-xs">{new Date(e.expense_date).toLocaleDateString()}</td>
 <td className="py-3 px-4"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{e.expense_type}</span></td>
 <td className="py-3 px-4 text-xs">{e.expense_category}</td>
 <td className="py-3 px-4 text-xs text-gray-600 truncate max-w-[120px]">{e.vendor_name || '-'}</td>
 <td className="py-3 px-4 text-xs text-gray-400 truncate max-w-[150px]">{e.description || '-'}</td>
 <td className="py-3 px-4 text-right font-medium">{(e.total_amount || e.amount || 0).toLocaleString()}</td>
 <td className="py-3 px-4">
 <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
 e.status === 'Paid' || e.status === 'Approved' ? 'bg-green-100 text-green-700 ' :
 e.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700 ' :
 e.status === 'Cancelled' || e.status === 'Rejected' ? 'bg-red-100 text-red-700 ' :
 'bg-gray-100 text-gray-600 '
 }`}>{e.status}</span>
 </td>
 <td className="py-3 px-4 text-xs">
 <span className={`${e.payment_status === 'Paid' ? 'text-green-600' : e.payment_status === 'Partially Paid' ? 'text-amber-600' : 'text-red-500'}`}>
 {e.payment_status || 'Unpaid'}
 </span>
 </td>
 <td className="py-3 px-4">
 <div className="flex items-center gap-1 justify-end">
 <button onClick={() => printPaymentVoucher(e)} className="p-1.5 hover:bg-indigo-50 :bg-indigo-900/20 rounded" title="Print Payment Voucher"><Printer size={13} className="text-indigo-400" /></button>
 <button onClick={() => openEdit(e)} className="p-1.5 hover:bg-blue-50 :bg-blue-900/20 rounded" title="Edit"><Pencil size={13} className="text-blue-400" /></button>
 <button onClick={() => remove(e.id)} className="p-1.5 hover:bg-red-50 :bg-red-900/20 rounded"><Trash2 size={13} className="text-red-400" /></button>
 </div>
 </td>
 </tr>
 ))}
 {expenses.length === 0 && <tr><td colSpan={10} className="text-center py-10 text-gray-400">No expenses recorded yet</td></tr>}
 </tbody>
 </table>
 </div>
 </div>

 {/* Add / Edit Modal */}
 <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Expense' : 'Add Expense'}>
 {/* Tabs */}
 <div className="flex gap-1 mb-4 border-b border-gray-200 -mx-4 px-4">
 {['basic', 'vendor', 'details', 'payment', 'notes'].map((t) => (
 <button key={t} onClick={() => setTab(t)}
 className={`px-3 py-2 text-[11px] font-medium border-b-2 transition-colors ${
 tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
 }`}>
 {t === 'basic' ? 'Basic Info' : t === 'vendor' ? 'Vendor' : t === 'details' ? 'Details' : t === 'payment' ? 'Payment' : 'Notes'}
 </button>
 ))}
 </div>

 <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
 {tab === 'basic' && (
 <>
 <div className="grid grid-cols-2 gap-3">
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Voucher No</label>
 <input value={form.voucher_no || ''} readOnly className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Voucher Date *</label>
 <input type="date" value={form.expense_date} onChange={(e) => update({ expense_date: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-800 " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Posting Date</label>
 <input type="date" value={form.posting_date || ''} onChange={(e) => update({ posting_date: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Expense Type *</label>
 <select value={form.expense_type} onChange={(e) => update({ expense_type: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 {EXPENSE_TYPES.map((t) => <option key={t}>{t}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Expense Category *</label>
 <select value={form.expense_category} onChange={(e) => update({ expense_category: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
 <select value={form.status} onChange={(e) => update({ status: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 {STATUSES.map((s) => <option key={s}>{s}</option>)}
 </select></div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Branch</label>
 <input value={form.branch || ''} onChange={(e) => update({ branch: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Vehicle (optional)</label>
 <select value={form.vehicle_id || ''} onChange={(e) => update({ vehicle_id: Number(e.target.value) || undefined })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 <option value="">-- None --</option>
 {vehicles.map((v) => <option key={v.id} value={v.id!}>{v.reg_number}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Warehouse (optional)</label>
 <select value={form.warehouse_id || ''} onChange={(e) => update({ warehouse_id: Number(e.target.value) || undefined })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 <option value="">-- None --</option>
 {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
 <select value={form.department || ''} onChange={(e) => update({ department: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 <option value="">-- Select --</option>
 {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
 </select></div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Cost Center</label>
 <input value={form.cost_center || ''} onChange={(e) => update({ cost_center: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Project / Job</label>
 <input value={form.project || ''} onChange={(e) => update({ project: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 </div>
 </>
 )}

 {tab === 'vendor' && (
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vendor / Payee Information</div>
 </div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Vendor Name</label>
 <input value={form.vendor_name || ''} onChange={(e) => update({ vendor_name: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Vendor Code</label>
 <input value={form.vendor_code || ''} onChange={(e) => update({ vendor_code: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Vendor Type</label>
 <input value={form.vendor_type || ''} onChange={(e) => update({ vendor_type: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Contact Person</label>
 <input value={form.contact_person || ''} onChange={(e) => update({ contact_person: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
 <input value={form.phone || ''} onChange={(e) => update({ phone: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
 <input value={form.vendor_email || ''} onChange={(e) => update({ vendor_email: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
 <textarea value={form.vendor_address || ''} onChange={(e) => update({ vendor_address: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " rows={2} /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">TRN / VAT Number</label>
 <input value={form.trn_vat_number || ''} onChange={(e) => update({ trn_vat_number: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 </div>
 )}

 {tab === 'details' && (
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expense Details</div>
 </div>
 <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Expense Head</label>
 <input value={form.expense_head || ''} onChange={(e) => update({ expense_head: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
 <textarea value={form.description || ''} onChange={(e) => update({ description: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " rows={2} /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
 <input type="number" value={form.quantity || ''} onChange={(e) => update({ quantity: Number(e.target.value) })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
 <select value={form.unit || 'Nos'} onChange={(e) => update({ unit: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 {UNITS.map((u) => <option key={u}>{u}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Unit Cost</label>
 <input type="number" value={form.unit_cost || ''} onChange={(e) => { const v = Number(e.target.value); update({ unit_cost: v, amount: (form.quantity || 1) * v }); }}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
 <input type="number" value={form.amount || ''} onChange={(e) => update({ amount: Number(e.target.value) })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Tax %</label>
 <input type="number" value={form.tax_percentage || ''} onChange={(e) => update({ tax_percentage: Number(e.target.value) })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Tax Amount</label>
 <input value={(form.tax_amount || 0).toFixed(2)} readOnly className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" /></div>
 <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Total Amount</label>
 <div className="text-lg font-bold text-indigo-600">{(form.total_amount || form.amount || 0).toLocaleString('en-IN')}</div></div>
 </div>
 )}

 {tab === 'payment' && (
 <div className="grid grid-cols-2 gap-3">
 <div className="col-span-2">
 <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Details</div>
 </div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
 <select value={form.payment_status} onChange={(e) => update({ payment_status: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Payment Mode</label>
 <select value={form.payment_mode} onChange={(e) => update({ payment_mode: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Bank Account</label>
 <input value={form.bank_account || ''} onChange={(e) => update({ bank_account: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Cheque Number</label>
 <input value={form.cheque_number || ''} onChange={(e) => update({ cheque_number: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Transaction Ref</label>
 <input value={form.reference_no || ''} onChange={(e) => update({ reference_no: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Payment Date</label>
 <input type="date" value={form.payment_date || ''} onChange={(e) => update({ payment_date: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Currency</label>
 <select value={form.currency} onChange={(e) => update({ currency: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ">
 {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
 </select></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Exchange Rate</label>
 <input type="number" step="0.01" value={form.exchange_rate || 1} onChange={(e) => update({ exchange_rate: Number(e.target.value) })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " /></div>
 </div>
 )}

 {tab === 'notes' && (
 <div>
 <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Internal Notes</div>
 <textarea value={form.notes || ''} onChange={(e) => update({ notes: e.target.value })}
 className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white " rows={6}
 placeholder="Enter any internal notes, remarks, or comments..." />
 </div>
 )}
 </div>

 <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 ">
 <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 :bg-gray-800 rounded-lg">Cancel</button>
 <button onClick={save} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">{editId ? 'Update' : 'Save'}</button>
 </div>
 </Modal>
 </div>
 );
}
