import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Booking, DeliveryPerson } from '../types';
import { Package, Trash2, Printer, Eye, Plus, Edit2, X } from 'lucide-react';
import Modal from './Modal';
import { consumeDetailId } from '../hooks/useNavigate';
import { invoiceHTML } from './PrintInvoice';

const COMPANY = {
  name: 'Planet Transport Pvt Ltd.',
  regdOffice: 'Tengpora, Byepass Srinagar-190010',
  phone: '9419428505, 9906661400',
};

function toTitleCase(s: string): string {
  if (!s) return '-';
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function printDeliverySheet(delivery: any) {
  const bookings = delivery.bookings || [];
  const totalBags = bookings.reduce((s: number, b: any) => s + (b.num_bags ?? 0), 0);

  const dp = delivery.delivery_person_name
    ? `<span class="label">Delivery Person:</span> <span class="val">${delivery.delivery_person_name}${delivery.delivery_person_phone ? ` | ${delivery.delivery_person_phone}` : ''}${delivery.delivery_person_vehicle ? ` | ${delivery.delivery_person_vehicle}` : ''}</span>`
    : '';

  const rows = bookings.map((b: any) => {
    const address = b.consignee_delivery_address || b.consignee_address || '-';
    return `    <tr>
      <td>${b.booking_no || '-'}</td>
      <td>${toTitleCase(b.consignee_name || '')}</td>
      <td style="max-width:160px;word-wrap:break-word;">${address}</td>
      <td>${b.consignee_contact || '-'}</td>
      <td class="r">${b.num_bags ?? '-'}</td>
      <td class="sig"></td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Delivery Sheet - ${delivery.delivery_no}</title>
<style>
  @page { size: A4; margin: 8mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: #1a1a1a; }
  .page { padding: 6px 0; position: relative; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 400px; opacity: 0.08; pointer-events: none; z-index: 0; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #dc2626; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo { width: 70px; height: auto; flex-shrink: 0; }
  .header-left h1 { font-size: 22px; color: #dc2626; margin: 0; font-weight: 800; letter-spacing: -0.3px; line-height: 1.1; }
  .header-detail { font-size: 11px; color: #666; }
  .header-phones { display: flex; gap: 14px; margin-top: 2px; font-size: 11px; color: #dc2626; font-weight: 600; }
  .header-right { text-align: right; }
  .sheet-badge { background: #1a1a1a; color: #fff; padding: 6px 20px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; border-radius: 4px; display: inline-block; }

  /* Info Grid */
  .info-grid { display: flex; gap: 16px; border: 1.2px solid #e5e7eb; border-radius: 4px; padding: 6px 10px; margin-bottom: 8px; font-size: 12px; background: #fafafa; flex-wrap: wrap; }
  .info-grid .label { color: #666; font-weight: 600; }
  .info-grid .val { font-weight: 600; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  td, th { border: 1.2px solid #e5e7eb; padding: 4px 8px; }
  th { background: #dc2626; color: #fff; font-size: 11px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; padding: 5px; }
  td { font-size: 12px; }
  .r { text-align: right; }
  .sig { min-width: 100px; height: 32px; }
  tfoot td { font-weight: 700; background: #fef2f2; border-top: 2px solid #dc2626; font-size: 13px; }

  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>

<div class="page">
  <div class="watermark">
    <svg viewBox="0 0 468.62 308.07" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ef453c" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24ZM140.3,159.38c5.43-20.2,10.72-21.22-12.53-25.83-6.58-2.1-5.93,9.46-8.64,13.48-4.76,10.27,14.8,8.25,21.17,12.36ZM235.79,132.05c6.24-.95,4.53-15.02,7.61-20.62-2.49-3.49-16.04-6.4-18.28-.63-6.74,21.67-12.66,16.33,10.68,21.25ZM195.9,174.31c-5.08,4.63-7.12,12.65-3.31,19.31,11.39,7.55,17.62-24.24,3.31-19.31ZM363.57,169.58c0-.19.01-.37.02-.56-74.01-8.8-74.42,6.46-.02.56ZM310.6,156.75c17.77,1.08,34.62,1.35,51.97,2.72-10.91-.92-48.76-14.53-51.97-2.72ZM362.57,149.68c.05-.2.1-.4.15-.6-63.25-20.67-66.13-6.53-.15.6ZM362.37,138.24c.1-.24.21-.47.31-.71-58.85-24-62.7-12.29-.31.71ZM320.79,111.9c10.24,3.66,22.28,9.45,32.54,10.67-5.36-2.2-32.29-20.07-32.54-10.67Z"/>
      <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
    </svg>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="brand">
        <svg class="logo" viewBox="0 0 468.62 308.07" xmlns="http://www.w3.org/2000/svg">
          <path fill="#fff" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24ZM140.3,159.38c5.43-20.2,10.72-21.22-12.53-25.83-6.58-2.1-5.93,9.46-8.64,13.48-4.76,10.27,14.8,8.25,21.17,12.36ZM235.79,132.05c6.24-.95,4.53-15.02,7.61-20.62-2.49-3.49-16.04-6.4-18.28-.63-6.74,21.67-12.66,16.33,10.68,21.25ZM195.9,174.31c-5.08,4.63-7.12,12.65-3.31,19.31,11.39,7.55,17.62-24.24,3.31-19.31ZM363.57,169.58c0-.19.01-.37.02-.56-74.01-8.8-74.42,6.46-.02.56ZM310.6,156.75c17.77,1.08,34.62,1.35,51.97,2.72-10.91-.92-48.76-14.53-51.97-2.72ZM362.57,149.68c.05-.2.1-.4.15-.6-63.25-20.67-66.13-6.53-.15.6ZM362.37,138.24c.1-.24.21-.47.31-.71-58.85-24-62.7-12.29-.31.71ZM320.79,111.9c10.24,3.66,22.28,9.45,32.54,10.67-5.36-2.2-32.29-20.07-32.54-10.67Z"/>
          <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
          <path fill="#ef453c" d="M384.85,123.81c-105.54-59.71-71.07-55.18-96.98,51.24-23.07,5.13,13.72-74.92,1.41-90.6-28.87-6.73-59.97-14.9-89.33-7.12-61.65,20.38-14.75,23.91,18.31,28.69-2.86,6.9-5.62,13.56-8.4,20.27-28.57-7.57-60.43-16.41-87.79-.38-10.15-1.73-20.52-11.45-29.76-17.08-3.81-2.51,1.93-3.81,1.39-7.01,47.27-143.49,264.07-127.22,291.16,21.99Z"/>
          <path fill="#2c2660" d="M140.3,159.38c-6.38-4.09-25.93-2.09-21.17-12.35,2.7-4.03,2.07-15.57,8.64-13.48,23.25,4.61,17.96,5.65,12.53,25.84Z"/>
          <path fill="#ef453c" d="M235.79,132.05c-23.36-4.91-17.4.39-10.68-21.25,2.26-5.81,15.78-2.84,18.28.62-3.07,5.62-1.37,19.66-7.61,20.63Z"/>
          <path fill="#2c2660" d="M195.9,174.31c13.85-4.72,8.66,25.42-2.88,19.76-4.53-6.39-2.23-15.13,2.88-19.76Z"/>
          <path fill="#ef453c" d="M363.57,169.58c-74.78,5.89-73.62-9.36.02-.56,0,.19-.01.37-.02.56Z"/>
          <path fill="#ef453c" d="M310.6,156.75c3.06-11.8,41.14,1.79,51.97,2.72-17.35-1.37-34.2-1.64-51.97-2.72Z"/>
          <path fill="#ef453c" d="M362.57,149.68c-66.25-7.2-62.82-21.21.15-.6-.05.2-.1.4-.15.6Z"/>
          <path fill="#ef453c" d="M362.37,138.24c-62.63-13.07-58.31-24.65.31-.71-.1.24-.21.47-.31.71Z"/>
          <path fill="#ef453c" d="M320.79,111.9c1.24-9.23,26.56,8.35,32.54,10.67-10.26-1.21-22.3-7-32.54-10.67Z"/>
        </svg>
        <div>
          <h1>${COMPANY.name}</h1>
          <div class="header-detail">${COMPANY.regdOffice}</div>
          <div class="header-detail" style="font-weight:700;">GSTIN: 01AAOCP0974B1ZQ</div>
          <div class="header-phones"><span>Delhi: 9555251516</span><span>Srinagar: 9906661400</span></div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="sheet-badge">DELIVERY SHEET</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <span><span class="label">Delivery No:</span> <span class="val">${delivery.delivery_no}</span></span>
    <span><span class="label">Date:</span> ${delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString('en-IN') : '-'}</span>
    ${dp}
  </div>

  <!-- Table -->
  <table>
    <thead><tr>
      <th>LR No</th><th>Consignee</th><th>Delivery Address</th><th>Contact</th>
      <th>Items</th><th>Customer Signature</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#999;">No items</td></tr>'}</tbody>
    <tfoot>
      <tr><td colspan="4" class="r">TOTAL</td><td class="r">${totalBags}</td><td></td></tr>
    </tfoot>
  </table>

</div>

</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups for printing.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [availableLRs, setAvailableLRs] = useState<Booking[]>([]);
  const [selectedLRs, setSelectedLRs] = useState<number[]>([]);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [selectedDP, setSelectedDP] = useState<number | ''>('');
  const [detail, setDetail] = useState<any>(null);
  const [tab, setTab] = useState<'send' | 'delivered'>('send');
  const [confirmDeliveryNo, setConfirmDeliveryNo] = useState('');
  const [confirmDelivery, setConfirmDelivery] = useState<any>(null);
  const [confirmSelected, setConfirmSelected] = useState<Set<number>>(new Set());
  const [dpModal, setDpModal] = useState(false);
  const [dpEdit, setDpEdit] = useState<DeliveryPerson | null>(null);
  const [dpForm, setDpForm] = useState<DeliveryPerson>({ name: '', phone: '', vehicle_number: '' });

  const loadDP = useCallback(() => {
    api.deliveryPersons.list().then(setDeliveryPersons);
  }, []);

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/deliveries').then((r) => r.json()).then(setDeliveries),
      api.bookings.list().then((all) => {
        const loaded = all.filter((b: Booking) => b.loaded === 1 && !b.out_for_delivery && b.delivered !== 1);
        setAvailableLRs(loaded);
      }),
    ]);
    loadDP();
  }, [loadDP]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = consumeDetailId();
    if (id) fetch(`/api/deliveries/${id}`).then(r => r.json()).then(setDetail);
  }, []);

  const toggleLR = (id: number) => {
    setSelectedLRs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const saveDelivery = async () => {
    if (selectedLRs.length === 0) { alert('Please select at least one LR'); return; }
    const unpaid = availableLRs.filter((b) => selectedLRs.includes(b.id!) && !b.paid);
    if (unpaid.length > 0) {
      if (!confirm(`${unpaid.length} unpaid LR(s) selected. Invoice(s) will be printed. Continue?`)) return;
    }
    await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_date: deliveryDate, delivery_person_id: selectedDP || undefined, booking_ids: selectedLRs }),
    });
    if (unpaid.length > 0) {
      const combined = unpaid.map((b) => invoiceHTML(b)).join('<div style="page-break-after:always"></div>');
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(combined);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
      }
    }
    setSelectedLRs([]);
    setSelectedDP('');
    load();
  };

  const remove = async (id: number) => {
    if (confirm('Remove this delivery?')) {
      await fetch(`/api/deliveries/${id}`, { method: 'DELETE' });
      load();
    }
  };

  const searchDelivery = async () => {
    if (!confirmDeliveryNo.trim()) return;
    const res = await fetch(`/api/deliveries`).then(r => r.json());
    const found = res.find((d: any) => d.delivery_no === confirmDeliveryNo.trim() && d.status === 'Out for Delivery');
    if (!found) { alert('Delivery not found or already delivered'); return; }
    const full = await fetch(`/api/deliveries/${found.id}`).then(r => r.json());
    setConfirmDelivery(full);
    setConfirmSelected(new Set(full.bookings.map((b: any) => b.id)));
  };

  const confirmDelivered = async () => {
    if (!confirmDelivery) return;
    const deliveredIds = confirmDelivery.bookings.filter((b: any) => confirmSelected.has(b.id)).map((b: any) => b.id);
    await fetch(`/api/deliveries/${confirmDelivery.id}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivered_ids: deliveredIds }),
    });
    setConfirmDelivery(null);
    setConfirmDeliveryNo('');
    load();
  };

  const toggleConfirmLR = (id: number) => {
    setConfirmSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const saveDP = async () => {
    if (!dpForm.name.trim()) { alert('Name is required'); return; }
    if (dpEdit?.id) await api.deliveryPersons.update(dpEdit.id, dpForm);
    else await api.deliveryPersons.create(dpForm);
    setDpModal(false); loadDP();
  };

  const removeDP = async (id: number) => {
    if (confirm('Delete this delivery person?')) { await api.deliveryPersons.delete(id); loadDP(); }
  };

  const totalBags = (detail?.bookings || []).reduce((s: number, b: any) => s + (b.num_bags ?? 0), 0);
  const totalWeight = (detail?.bookings || []).reduce((s: number, b: any) => s + (b.charged_weight ?? b.actual_weight ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Delivery</h1>
        </div>
        <button onClick={() => { setDpEdit(null); setDpForm({ name: '', phone: '', vehicle_number: '' }); setDpModal(true); }} className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">
          <Plus size={16} /> Delivery Persons ({deliveryPersons.length})
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('send')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'send' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Send for Delivery</button>
        <button onClick={() => setTab('delivered')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'delivered' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Delivered</button>
      </div>

      {/* Send for Delivery */}
      {tab === 'send' && (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Send for Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Delivery Person</label>
            <select value={selectedDP} onChange={(e) => setSelectedDP(Number(e.target.value) || '')} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select delivery person</option>
              {deliveryPersons.filter((p) => p.status !== 'Inactive').map((dp) => <option key={dp.id} value={dp.id!}>{dp.name}{dp.vehicle_number ? ` (${dp.vehicle_number})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Delivery Date</label>
            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={saveDelivery} className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
              <Package size={16} /> Send for Delivery
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Select LR(s) for Delivery ({selectedLRs.length} selected)</label>
          {availableLRs.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">No loaded LRs available. Load a vehicle first.</p>
          ) : (
            <div className="border dark:border-gray-600 rounded-lg max-h-48 overflow-y-auto">
              {availableLRs.map((b) => {
                const selected = selectedLRs.includes(b.id!);
                return (
                  <div key={b.id} onClick={() => toggleLR(b.id!)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer border-b last:border-0 ${selected ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200' : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900'}`}
                  >
                    <input type="checkbox" checked={selected} readOnly className="rounded" />
                    <span className="font-mono text-xs font-medium w-28">{b.booking_no}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 w-36 truncate">{b.consignor_name || '-'}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 w-36 truncate">{b.consignee_name || '-'}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-24">{b.from_location || '-'} → {b.to_location || '-'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-20">{b.actual_weight ? `${b.actual_weight} kg` : '-'}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-28">{b.eway_bill_no || '-'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Delivered */}
      {tab === 'delivered' && (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Confirm Delivery</h2>
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Delivery Number</label>
            <input type="text" placeholder="Type delivery number like DLV-..." value={confirmDeliveryNo} onChange={(e) => setConfirmDeliveryNo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchDelivery()} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button onClick={searchDelivery} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Search</button>
        </div>

        {confirmDelivery && (
          <div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3 text-xs text-gray-600 dark:text-gray-300 flex gap-4 flex-wrap">
              <span><strong>Delivery:</strong> {confirmDelivery.delivery_no}</span>
              <span><strong>Person:</strong> {confirmDelivery.delivery_person_name || '-'}</span>
              <span><strong>Date:</strong> {confirmDelivery.delivery_date ? new Date(confirmDelivery.delivery_date).toLocaleDateString() : '-'}</span>
            </div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Select LRs that were delivered (unchecked LRs will go back for re-delivery)</label>
            <div className="border dark:border-gray-600 rounded-lg mb-3">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left py-2 px-3 w-8"></th>
                    <th className="text-left py-2 px-3">LR #</th>
                    <th className="text-left py-2 px-3">Consignee</th>
                    <th className="text-left py-2 px-3">Address</th>
                    <th className="text-left py-2 px-3">Contact</th>
                    <th className="text-left py-2 px-3">Nags</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(confirmDelivery.bookings || []).map((b: any) => (
                    <tr key={b.id} onClick={() => toggleConfirmLR(b.id)} className={`cursor-pointer text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 ${confirmSelected.has(b.id) ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50/50 dark:bg-red-900/10'}`}>
                      <td className="py-2 px-3"><input type="checkbox" checked={confirmSelected.has(b.id)} readOnly className="rounded" /></td>
                      <td className="py-2 px-3 font-mono font-medium">{b.booking_no}</td>
                      <td className="py-2 px-3">{b.consignee_name || '-'}</td>
                      <td className="py-2 px-3 max-w-[160px] truncate">{b.consignee_delivery_address || b.consignee_address || '-'}</td>
                      <td className="py-2 px-3">{b.consignee_contact || '-'}</td>
                      <td className="py-2 px-3">{b.num_bags ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setConfirmDelivery(null); setConfirmDeliveryNo(''); }} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={confirmDelivered} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
                <Package size={16} /> Confirm Delivered ({confirmSelected.size} of {(confirmDelivery.bookings || []).length})
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* History */}
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Delivery History</h2>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Delivery #</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Delivery Person</th>
                <th className="text-left py-3 px-4">LRs</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                  <td className="py-3 px-4 font-mono text-xs font-medium">{d.delivery_no}</td>
                  <td className="py-3 px-4 text-xs">{d.delivery_date ? new Date(d.delivery_date).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4 text-xs">{d.delivery_person_name || '-'}</td>
                  <td className="py-3 px-4 text-xs">{d.item_count ?? 0}</td>
                  <td className="py-3 px-4">
                    <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-xs font-medium">{d.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={async () => { const r = await fetch(`/api/deliveries/${d.id}`).then(r => r.json()); setDetail(r); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Eye size={14} className="text-gray-400 dark:text-gray-500" /></button>
                      <button onClick={async () => { const r = await fetch(`/api/deliveries/${d.id}`).then(r => r.json()); printDeliverySheet(r); }} className="p-1 hover:bg-blue-50 rounded"><Printer size={14} className="text-blue-400" /></button>
                      <button onClick={() => remove(d.id!)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {deliveries.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400 dark:text-gray-500">No deliveries yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Delivery: ${detail?.delivery_no || ''}`} wide>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400 dark:text-gray-500">Date:</span> {detail.delivery_date ? new Date(detail.delivery_date).toLocaleDateString() : '-'}</div>
              <div><span className="text-gray-400 dark:text-gray-500">Delivery Person:</span> {detail.delivery_person_name || '-'} {detail.delivery_person_phone ? `| ${detail.delivery_person_phone}` : ''} {detail.delivery_person_vehicle ? `| ${detail.delivery_person_vehicle}` : ''}</div>
            </div>
            <div className="border dark:border-gray-600 rounded-lg">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left py-2 px-3">LR #</th>
                    <th className="text-left py-2 px-3">Consignee</th>
                    <th className="text-left py-2 px-3">Delivery Address</th>
                    <th className="text-left py-2 px-3">Contact</th>
                    <th className="text-left py-2 px-3">Nags</th>
                    <th className="text-left py-2 px-3">Weight</th>
                    <th className="text-left py-2 px-3">E-Way Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(detail.bookings || []).map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 text-xs">
                      <td className="py-2 px-3 font-mono font-medium">{b.booking_no}</td>
                      <td className="py-2 px-3">{b.consignee_name || '-'}</td>
                      <td className="py-2 px-3 max-w-[180px] truncate">{b.consignee_delivery_address || b.consignee_address || '-'}</td>
                      <td className="py-2 px-3">{b.consignee_contact || '-'}</td>
                      <td className="py-2 px-3">{b.num_bags ?? '-'}</td>
                      <td className="py-2 px-3">{b.charged_weight ?? b.actual_weight ?? '-'}</td>
                      <td className="py-2 px-3 font-mono text-[10px]">{b.eway_bill_no || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900 font-semibold text-xs">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right">TOTAL:</td>
                    <td className="py-2 px-3">{totalBags}</td>
                    <td className="py-2 px-3">{totalWeight} kg</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={() => printDeliverySheet(detail)} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
                <Printer size={16} /> Print Delivery Sheet
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delivery Persons Management Modal */}
      <Modal open={dpModal} onClose={() => setDpModal(false)} title="Manage Delivery Persons">
        <div className="space-y-4">
          <div className="text-xs text-gray-400 dark:text-gray-500">{deliveryPersons.length} person(s)</div>
          <div className="border dark:border-gray-600 rounded-lg">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Phone</th>
                  <th className="text-left py-2 px-3">Vehicle</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-right py-2 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deliveryPersons.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 text-xs">
                    <td className="py-2 px-3 font-medium">{p.name}</td>
                    <td className="py-2 px-3">{p.phone || '-'}</td>
                    <td className="py-2 px-3">{p.vehicle_number || '-'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${p.status === 'Active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-gray-100 text-gray-600'}`}>{p.status || 'Active'}</span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setDpEdit(p); setDpForm({ name: p.name, phone: p.phone || '', vehicle_number: p.vehicle_number || '' }); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Edit2 size={12} className="text-gray-400" /></button>
                        <button onClick={() => removeDP(p.id!)} className="p-1 hover:bg-red-50 rounded"><X size={12} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">{dpEdit ? 'Edit Delivery Person' : 'Add Delivery Person'}</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name *</label>
                <input value={dpForm.name} onChange={(e) => setDpForm({ ...dpForm, name: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                <input value={dpForm.phone || ''} onChange={(e) => setDpForm({ ...dpForm, phone: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle</label>
                <input value={dpForm.vehicle_number || ''} onChange={(e) => setDpForm({ ...dpForm, vehicle_number: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setDpEdit(null)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={saveDP} className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                {dpEdit ? 'Update' : 'Add'} Person
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
