import { useEffect, useState } from 'react';
import { api } from '../api';
import { Payment, Customer, Invoice } from '../types';
import { Plus, Trash2, Banknote, Printer } from 'lucide-react';
import Modal from './Modal';
import { printPaymentReceipt } from './PrintPaymentReceipt';

export default function Payments() {
 const [payments, setPayments] = useState<(Payment & { invoice_no?: string })[]>([]);
 const [customers, setCustomers] = useState<Customer[]>([]);
 const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
 const [modal, setModal] = useState(false);
 const [form, setForm] = useState<Payment>({
 payment_no: '', payment_type: 'Received', party_type: 'Customer', party_id: undefined,
 party_name: '', invoice_id: undefined, amount: 0,
 payment_date: new Date().toISOString().slice(0, 10), payment_mode: 'Cash', reference_no: '', notes: '',
 });

 const load = () => Promise.all([
 api.payments.list().then(setPayments),
 api.customers.list().then(setCustomers),
 api.invoices.list().then(setAllInvoices),
 ]);

 useEffect(() => { load(); }, []);

 const save = async () => {
 const selectedCust = form.party_type === 'Customer' ? customers.find((c) => c.id === form.party_id) : null;
 await api.payments.create({ ...form, party_name: selectedCust?.name || form.party_name });
 setModal(false); load();
 };

 const remove = async (id: number) => {
 if (confirm('Delete this payment?')) { await api.payments.delete(id); load(); }
 };

 const getInvoice = (payment: any): Invoice | undefined =>
 allInvoices.find((i) => i.id === payment.invoice_id);

 const unpaidInvoices = allInvoices.filter((i) => i.status === 'Unpaid' || i.status === 'Partial');

 return (
 <div>
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Banknote className="text-indigo-600" size={24} />
 <h1 className="text-2xl font-bold text-gray-800 ">Payment Management</h1>
 </div>
 <button onClick={() => { setForm({ payment_no: '', payment_type: 'Received', party_type: 'Customer', party_id: undefined, party_name: '', invoice_id: undefined, amount: 0, payment_date: new Date().toISOString().slice(0, 10), payment_mode: 'Cash', reference_no: '', notes: '' }); setModal(true); }}
 className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
 <Plus size={16} /> Record Payment
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
 <p className="text-xs text-gray-500 ">Total Payments</p>
 <p className="text-xl font-bold">{payments.length}</p>
 </div>
 <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
 <p className="text-xs text-gray-500 ">Total Received</p>
 <p className="text-xl font-bold">{payments.filter(p => p.payment_type === 'Received').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
 </div>
 <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
 <p className="text-xs text-gray-500 ">Total Paid Out</p>
 <p className="text-xl font-bold">{payments.filter(p => p.payment_type === 'Sent').reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
 <tr><th className="text-left py-3 px-4">Receipt #</th><th className="text-left py-3 px-4">Type</th><th className="text-left py-3 px-4">Party</th><th className="text-left py-3 px-4">Invoice</th><th className="text-left py-3 px-4">Amount</th><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Mode</th><th className="text-left py-3 px-4">Reference</th><th className="text-right py-3 px-4">Actions</th></tr>
 </thead>
 <tbody className="divide-y divide-gray-50 ">
 {payments.map((p) => (
 <tr key={p.id} className="hover:bg-gray-50 :bg-gray-800 ">
 <td className="py-3 px-4 font-mono text-xs font-medium">{p.payment_no}</td>
 <td className="py-3 px-4">
 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.payment_type === 'Received' ? 'bg-green-100 text-green-700 ' : 'bg-red-100 text-red-700 '}`}>{p.payment_type}</span>
 </td>
 <td className="py-3 px-4 text-xs">{p.party_name || (p.party_type === 'Customer' ? `Customer #${p.party_id}` : `${p.party_type} #${p.party_id}`)}</td>
 <td className="py-3 px-4 font-mono text-xs">{p.invoice_id ? (getInvoice(p)?.invoice_no || `#${p.invoice_id}`) : '-'}</td>
 <td className="py-3 px-4 font-medium">{(p.amount || 0).toLocaleString()}</td>
 <td className="py-3 px-4 text-xs">{new Date(p.payment_date).toLocaleDateString()}</td>
 <td className="py-3 px-4 text-xs">{p.payment_mode}</td>
 <td className="py-3 px-4 text-xs">{p.reference_no || '-'}</td>
 <td className="py-3 px-4 text-right">
 <div className="flex items-center justify-end gap-1">
 <button onClick={() => printPaymentReceipt(p, getInvoice(p))} className="p-1.5 hover:bg-indigo-50 :bg-indigo-900/20 rounded" title="Print Receipt"><Printer size={13} className="text-indigo-400" /></button>
 <button onClick={() => remove(p.id!)} className="p-1.5 hover:bg-red-50 :bg-red-900/20 rounded"><Trash2 size={13} className="text-red-400" /></button>
 </div>
 </td>
 </tr>
 ))}
 {payments.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400 ">No payments recorded yet</td></tr>}
 </tbody>
 </table>
 </div>
 </div>

 <Modal open={modal} onClose={() => setModal(false)} title="Record Payment">
 <div className="grid grid-cols-2 gap-3">
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Payment Type</label>
 <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>Received</option><option>Sent</option>
 </select>
 </div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Party Type</label>
 <select value={form.party_type} onChange={(e) => setForm({ ...form, party_type: e.target.value, party_id: undefined, invoice_id: undefined })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>Customer</option><option>Supplier</option><option>Employee</option><option>Other</option>
 </select>
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Party</label>
 <select value={form.party_id || ''} onChange={(e) => setForm({ ...form, party_id: Number(e.target.value) || undefined })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option value="">Select</option>
 {form.party_type === 'Customer' && customers.map((c) => <option key={c.id} value={c.id!}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
 </select>
 </div>
 <div className="col-span-2">
 <label className="block text-xs font-medium text-gray-500 mb-1">Invoice (optional)</label>
 <select value={form.invoice_id || ''} onChange={(e) => setForm({ ...form, invoice_id: Number(e.target.value) || undefined })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option value="">No invoice</option>
 {unpaidInvoices.filter((i) => !form.party_id || i.customer_id === form.party_id).map((i) => (
 <option key={i.id} value={i.id!}>{i.invoice_no} - {(i.total_amount || 0).toLocaleString()} (due: {((i.total_amount || 0) - (i.paid_amount || 0)).toLocaleString()})</option>
 ))}
 </select>
 </div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Amount *</label><input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Date *</label><input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Payment Mode</label>
 <select value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
 <option>Cash</option><option>Bank Transfer</option><option>Cheque</option><option>Credit Card</option><option>UPI</option>
 </select>
 </div>
 <div><label className="block text-xs font-medium text-gray-500 mb-1">Reference No</label><input value={form.reference_no || ''} onChange={(e) => setForm({ ...form, reference_no: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
 <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 mb-1">Notes</label><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} /></div>
 </div>
 <div className="flex justify-end gap-3 mt-6">
 <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 :bg-gray-800 rounded-lg">Cancel</button>
 <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
 </div>
 </Modal>
 </div>
 );
}
