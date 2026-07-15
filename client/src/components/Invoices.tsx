import { useEffect, useState } from 'react';
import { api } from '../api';
import { Invoice, Customer } from '../types';
import { Plus, Trash2, FileText, Eye, Printer } from 'lucide-react';
import Modal from './Modal';
import { printCustomerInvoice } from './PrintCustomerInvoice';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Invoice>({
    invoice_no: '', customer_id: undefined, invoice_date: new Date().toISOString().slice(0, 10),
    due_date: '', subtotal: 0, tax_percent: 0, tax_amount: 0, total_amount: 0, notes: '',
  });

  const load = () => Promise.all([
    api.invoices.list().then(setInvoices),
    api.customers.list().then(setCustomers),
  ]);

  useEffect(() => { load(); }, []);

  const calcTax = (sub: number, pct: number) => ({ tax_amount: sub * (pct / 100), total_amount: sub + sub * (pct / 100) });

  const save = async () => {
    await api.invoices.create(form);
    setModal(false); load();
  };

  const remove = async (id: number) => {
    if (confirm('Delete this invoice?')) { await api.invoices.delete(id); load(); }
  };

  const statusColors: Record<string, string> = {
    Unpaid: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    Partial: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    Paid: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Invoices & Billing</h1>
        </div>
        <button onClick={() => { setForm({ invoice_no: '', customer_id: undefined, invoice_date: new Date().toISOString().slice(0, 10), due_date: '', subtotal: 0, tax_percent: 0, tax_amount: 0, total_amount: 0, notes: '' }); setModal(true); }}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm dark:shadow-gray-900/30 border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="text-xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm dark:shadow-gray-900/30 border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
          <p className="text-xl font-bold">{invoices.reduce((s, i) => s + (i.total_amount || 0), 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm dark:shadow-gray-900/30 border text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Outstanding</p>
          <p className="text-xl font-bold text-red-600">{invoices.reduce((s, i) => s + ((i.total_amount || 0) - (i.paid_amount || 0)), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr><th className="text-left py-3 px-4">Invoice #</th><th className="text-left py-3 px-4">Customer</th><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Due Date</th><th className="text-left py-3 px-4">Total</th><th className="text-left py-3 px-4">Paid</th><th className="text-left py-3 px-4">Balance</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {invoices.map((inv) => {
                const balance = (inv.total_amount || 0) - (inv.paid_amount || 0);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                    <td className="py-3 px-4 font-mono text-xs font-medium">{inv.invoice_no}</td>
                    <td className="py-3 px-4 font-medium">{inv.customer_name || '-'}</td>
                    <td className="py-3 px-4 text-xs">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4 font-medium">{(inv.total_amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">{(inv.paid_amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium">{balance > 0 ? balance.toLocaleString() : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inv.status || 'Unpaid'] || 'bg-gray-100'}`}>{inv.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setDetail(inv)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Eye size={14} className="text-gray-400 dark:text-gray-500" /></button>
                        <button onClick={() => remove(inv.id!)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400 dark:text-gray-500">No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Invoice">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer *</label>
            <select value={form.customer_id || ''} onChange={(e) => setForm({ ...form, customer_id: Number(e.target.value) })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c.id} value={c.id!}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Invoice Date *</label><input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</label><input type="date" value={form.due_date || ''} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Subtotal *</label><input type="number" value={form.subtotal || ''} onChange={(e) => { const s = Number(e.target.value); const t = calcTax(s, form.tax_percent || 0); setForm({ ...form, subtotal: s, ...t }); }} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tax (%)</label><input type="number" value={form.tax_percent || ''} onChange={(e) => { const p = Number(e.target.value); const t = calcTax(form.subtotal || 0, p); setForm({ ...form, tax_percent: p, ...t }); }} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tax Amount</label><input type="number" value={form.tax_amount || 0} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300" readOnly /></div>
          <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Amount</label><input type="number" value={form.total_amount || 0} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 font-bold" readOnly /></div>
          <div className="col-span-2"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label><textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
        </div>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Invoice ${detail?.invoice_no || ''}`}>
        {detail && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-400 dark:text-gray-500">Customer:</span> <span className="font-medium">{detail.customer_name}</span></div>
              <div><span className="text-gray-400 dark:text-gray-500">Company:</span> {detail.customer_company || '-'}</div>
              <div><span className="text-gray-400 dark:text-gray-500">Invoice Date:</span> {new Date(detail.invoice_date).toLocaleDateString()}</div>
              <div><span className="text-gray-400 dark:text-gray-500">Due Date:</span> {detail.due_date ? new Date(detail.due_date).toLocaleDateString() : '-'}</div>
            </div>
            <hr />
            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500">Subtotal:</span><span>{(detail.subtotal || detail.total_amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500">Tax ({(detail.tax_percent || 0)}%):</span><span>{(detail.tax_amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total:</span><span>{(detail.total_amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500">Paid:</span><span className="text-green-600">{(detail.paid_amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-500">Balance:</span><span className="text-red-600">{((detail.total_amount || 0) - (detail.paid_amount || 0)).toLocaleString()}</span></div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[detail.status || 'Unpaid']}`}>{detail.status}</span>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const newStatus = detail.status === 'Paid' ? 'Unpaid' : 'Paid';
                    await api.invoices.update(detail.id!, { status: newStatus, paid_amount: newStatus === 'Paid' ? detail.total_amount : 0 });
                    load(); setDetail(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${detail.status === 'Paid' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {detail.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                </button>
                <button onClick={() => printCustomerInvoice(detail)} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-xs">
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
            {detail.notes && <p className="text-gray-500 dark:text-gray-400 italic">{detail.notes}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
