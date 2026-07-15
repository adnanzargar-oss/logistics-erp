import { useEffect, useState } from 'react';
import { api } from '../api';
import { Warehouse } from '../types';
import { Plus, Edit2, Trash2, Printer, Warehouse as WarehouseIcon } from 'lucide-react';
import Modal from './Modal';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Warehouse | null>(null);
  const [form, setForm] = useState<Warehouse>({
    name: '', address: '', city: '', contact_person: '', phone: '', email: '',
  });
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

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

  const printMonthlyReport = async (w: Warehouse) => {
    const res = await fetch(`/api/warehouses/${w.id}/monthly-report?month=${reportMonth}`);
    const data = await res.json();
    const { warehouse, month, dailyReport, totals } = data;
    const hasData = dailyReport?.some((d: any) => d.loadings || d.receivings || d.deliveries);

    const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const daysHTML = dailyReport?.map((d: any) => `
      <tr>
        <td class="val-cell">${d.date.slice(-2)}</td>
        <td class="center">${d.loadings}</td>
        <td class="center">${d.receivings}</td>
        <td class="center">${d.nags_received}</td>
        <td class="center">${d.shortage > 0 ? d.shortage : '-'}</td>
        <td class="center">${d.deliveries}</td>
      </tr>
    `).join('') || '';

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Monthly Report - ${warehouse.name}</title>
<style>
  @page { size: A4; margin: 6mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: #1a1a1a; }
  .page { padding: 8px 0; position: relative; }
  .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 340px; opacity: 0.08; pointer-events: none; z-index: 0; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #dc2626; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .logo { width: 120px; height: auto; flex-shrink: 0; overflow: visible; }
  .header-left h1 { font-size: 22px; color: #dc2626; margin: 0; font-weight: 800; letter-spacing: -0.3px; line-height: 1.1; }
  .header-detail { font-size: 11px; color: #666; }
  .header-phones { display: flex; gap: 14px; margin-top: 2px; font-size: 11px; color: #dc2626; font-weight: 600; }
  .header-right { text-align: center; }
  .report-box { background: #fef2f2; border: 1.5px solid #dc2626; border-radius: 6px; padding: 5px 14px; }
  .report-label { font-size: 9px; text-transform: uppercase; color: #dc2626; font-weight: 600; letter-spacing: 0.3px; }
  .report-value { font-size: 13px; font-weight: 700; color: #1a1a1a; }

  .sub-header { background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 4px; padding: 4px 10px; margin-bottom: 8px; font-size: 12px; }
  .sub-header strong { color: #dc2626; }

  .section-title { background: #dc2626; color: #fff; padding: 3px 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; border-radius: 3px; }

  .data-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  .data-table td, .data-table th { border: 1.2px solid #e5e7eb; padding: 3px 6px; }
  .data-table th { background: #dc2626; color: #fff; font-size: 10px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; padding: 3px; }
  .data-table td { font-size: 11px; }
  .val-cell { color: #1a1a1a; }
  .center { text-align: center; }
  .data-table tr:nth-child(even) td { background: #fafafa; }

  .total-row td { border-top: 2px solid #dc2626; background: #fef2f2; font-weight: 700; font-size: 12px; }

  .summary-grid { display: flex; gap: 8px; margin-top: 8px; }
  .summary-item { flex: 1; text-align: center; padding: 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .summary-item .num { font-size: 16px; font-weight: 800; }

  .footer { text-align: center; font-size: 9px; color: #999; margin-top: 10px; padding-top: 6px; border-top: 1px solid #eee; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="page">
    <div class="watermark">
      <svg viewBox="0 0 468.62 308.07" xmlns="http://www.w3.org/2000/svg">
        <path fill="#ef453c" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24ZM140.3,159.38c5.43-20.2,10.72-21.22-12.53-25.83-6.58-2.1-5.93,9.46-8.64,13.48-4.76,10.27,14.8,8.25,21.17,12.36ZM235.79,132.05c6.24-.95,4.53-15.02,7.61-20.62-2.49-3.49-16.04-6.4-18.28-.63-6.74,21.67-12.66,16.33,10.68,21.25ZM195.9,174.31c-5.08,4.63-7.12,12.65-3.31,19.31,11.39,7.55,17.62-24.24,3.31-19.31ZM363.57,169.58c0-.19.01-.37.02-.56-74.01-8.8-74.42,6.46-.02.56ZM310.6,156.75c17.77,1.08,34.62,1.35,51.97,2.72-10.91-.92-48.76-14.53-51.97-2.72ZM362.57,149.68c.05-.2.1-.4.15-.6-63.25-20.67-66.13-6.53-.15.6ZM362.37,138.24c.1-.24.21-.47.31-.71-58.85-24-62.7-12.29-.31.71ZM320.79,111.9c10.24,3.66,22.28,9.45,32.54,10.67-5.36-2.2-32.29-20.07-32.54-10.67Z"/>
        <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
      </svg>
    </div>

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
            <h1>Planet Transport Pvt Ltd.</h1>
            <div class="header-detail">Tengpora Bypass, Srinagar - 190010</div>
            <div class="header-detail" style="font-weight:700;">GSTIN: 01AAOCP0974B1ZQ</div>
            <div class="header-phones"><span>Delhi: 9555251516</span><span>Srinagar: 9906661400</span></div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="report-box">
          <div class="report-label">Monthly Report</div>
          <div class="report-value">${monthName}</div>
        </div>
      </div>
    </div>

    <div class="sub-header">
      <strong>Warehouse:</strong> ${warehouse.name} ${warehouse.code ? '(' + warehouse.code + ')' : ''} &nbsp;|&nbsp;
      <strong>City:</strong> ${warehouse.city || '-'}
      ${warehouse.contact_person ? '&nbsp;|&nbsp;<strong>Contact:</strong> ' + warehouse.contact_person : ''}
    </div>

    <div class="section-title">Daily Movement Summary</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Day</th>
          <th>Loadings</th>
          <th>Receivings</th>
          <th>Nags Recv</th>
          <th>Shortage</th>
          <th>Deliveries</th>
        </tr>
      </thead>
      <tbody>
        ${daysHTML}
        <tr class="total-row">
          <td class="val-cell"><strong>TOTAL</strong></td>
          <td class="center"><strong>${totals.loadings}</strong></td>
          <td class="center"><strong>${totals.receivings}</strong></td>
          <td class="center"><strong>${totals.nags_received}</strong></td>
          <td class="center"><strong>${totals.shortage}</strong></td>
          <td class="center"><strong>${totals.deliveries}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="summary-grid">
      <div class="summary-item" style="background:#fef2f2;color:#dc2626;">
        <div class="num">${totals.loadings}</div>
        Loadings
      </div>
      <div class="summary-item" style="background:#fef2f2;color:#dc2626;">
        <div class="num">${totals.receivings}</div>
        Receivings
      </div>
      <div class="summary-item" style="background:#fef2f2;color:#dc2626;">
        <div class="num">${totals.nags_received}</div>
        Nags Received
      </div>
      <div class="summary-item" style="background:#fef2f2;color:#dc2626;">
        <div class="num">${totals.shortage}</div>
        Total Shortage
      </div>
      <div class="summary-item" style="background:#fef2f2;color:#dc2626;">
        <div class="num">${totals.deliveries}</div>
        Deliveries
      </div>
    </div>

    <div class="footer">Generated by PlanetERP — ${new Date().toLocaleDateString('en-IN')}</div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow popups for printing.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <WarehouseIcon className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Warehouses</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-gray-200"
          />
          <button onClick={openCreate} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
            <Plus size={16} /> Add Warehouse
          </button>
        </div>
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
              <button onClick={() => printMonthlyReport(w)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                <Printer size={12} /> Report
              </button>
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
