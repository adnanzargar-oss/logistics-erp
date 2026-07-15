import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import { Vehicle, Warehouse, Receiving } from '../types';
import { ArrowDownToLine, Plus, Trash2, Printer, Eye, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const COMPANY = {
  name: 'Planet Transport Pvt Ltd.',
  regdOffice: 'Tengpora, Byepass Srinagar-190010',
  phone: '9419428505, 9906661400',
};

function toTitleCase(s: string): string {
  if (!s) return '-';
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function printReceivingSheet(receiving: any) {
  const bookings = receiving.bookings || [];
  const totalBags = bookings.reduce((s: number, b: any) => s + (b.num_bags ?? 0), 0);
  const totalReceived = bookings.reduce((s: number, b: any) => s + (b.bags_received ?? 0), 0);
  const totalShort = bookings.reduce((s: number, b: any) => s + (b.short_bags ?? 0), 0);

  const rows = bookings.map((b: any) => {
    const short = b.short_bags ?? 0;
    return `<tr${short > 0 ? ' style="background:#fff0f0;"' : ''}>
      <td>${b.booking_no || '-'}</td>
      <td>${toTitleCase(b.consignor_name || '')}</td>
      <td>${toTitleCase(b.consignee_name || '')}</td>
      <td class="r">${b.num_bags ?? '-'}</td>
      <td class="r">${b.bags_received ?? '-'}</td>
      <td class="r">${short}</td>
      <td>${b.notes || ''}</td>
    </tr>`;
  }).join('');

  const hasShortages = bookings.some((b: any) => (b.short_bags ?? 0) > 0);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Goods Received Note - ${receiving.receiving_no}</title>
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
  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; border: 1.2px solid #e5e7eb; border-radius: 4px; padding: 6px 10px; margin-bottom: 8px; font-size: 12px; background: #fafafa; }
  .info-grid .label { color: #666; font-weight: 600; }
  .info-grid .val { font-weight: 600; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  td, th { border: 1.2px solid #e5e7eb; padding: 4px 8px; }
  th { background: #dc2626; color: #fff; font-size: 11px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; padding: 5px; }
  td { font-size: 12px; }
  .r { text-align: right; }
  tfoot td { font-weight: 700; background: #fef2f2; border-top: 2px solid #dc2626; font-size: 13px; }

  /* Shortage */
  .shortage-warning { background: #fef2f2; border: 1.5px solid #dc2626; border-radius: 4px; padding: 6px 10px; margin-bottom: 6px; font-size: 12px; font-weight: 700; color: #dc2626; text-align: center; }

  /* Summary */
  .summary-bar { display: flex; gap: 16px; justify-content: center; margin: 8px 0; }
  .summary-bar span { padding: 5px 14px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 4px; font-size: 12px; font-weight: 700; color: #dc2626; }

  /* Signatures */
  .signatures { display: flex; justify-content: space-between; margin-top: 14px; gap: 14px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-line { border-top: 1.5px solid #444; padding-top: 2px; margin-bottom: 2px; min-height: 35px; }
  .sig-box span { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.3px; }

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
      <div class="sheet-badge">GOODS RECEIVED NOTE</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div><span class="label">Receiving No:</span> <span class="val">${receiving.receiving_no}</span></div>
    <div><span class="label">Date:</span> ${receiving.receiving_date ? new Date(receiving.receiving_date).toLocaleDateString('en-IN') : '-'}</div>
    <div><span class="label">Vehicle:</span> <span class="val">${receiving.vehicle_reg || '-'}</span></div>
    <div><span class="label">Warehouse:</span> ${receiving.warehouse_name || '-'}</div>
    <div><span class="label">Driver:</span> ${toTitleCase(receiving.driver_name || '')} ${receiving.driver_phone ? `| ${receiving.driver_phone}` : ''}</div>
    <div><span class="label">License:</span> ${receiving.license_number || '-'}</div>
  </div>

  <!-- Table -->
  <table>
    <thead><tr>
      <th>LR No</th><th>Consignor</th><th>Consignee</th><th>Expected Items</th><th>Received Items</th><th>Short</th><th>Remarks</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#999;">No items</td></tr>'}</tbody>
    <tfoot>
      <tr><td colspan="3" class="r">TOTAL</td><td class="r">${totalBags}</td><td class="r">${totalReceived}</td><td class="r">${totalShort}</td><td></td></tr>
    </tfoot>
  </table>

  ${hasShortages ? `<div class="shortage-warning">⚠ SHORTAGE DETECTED — ${totalShort} bag(s) missing</div>` : ''}

  <!-- Summary -->
  <div class="summary-bar">
    <span>Total LRs: ${bookings.length}</span>
    <span>Expected: ${totalBags}</span>
    <span>Received: ${totalReceived}</span>
    <span>Short: ${totalShort}</span>
  </div>
  <div class="signatures">
    <div class="sig-box"><div class="sig-line"></div><span>Warehouse Incharge</span></div>
    <div class="sig-box"><div class="sig-line"></div><span>Driver Signature</span></div>
  </div>

</div>

</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups for printing.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

export default function Receivings() {
  const [receivings, setReceivings] = useState<Receiving[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | ''>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');
  const [receivingDate, setReceivingDate] = useState(new Date().toISOString().slice(0, 10));
  const [vehicleLoads, setVehicleLoads] = useState<any[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<any>(null);
  const [bookingReceivings, setBookingReceivings] = useState<Record<number, number>>({});
  const [detail, setDetail] = useState<Receiving | null>(null);
  const [loadSearch, setLoadSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [shortageNotes, setShortageNotes] = useState<Record<number, string>>({});

  const load = useCallback(() => {
    Promise.all([
      api.receivings.list().then(setReceivings),
      api.vehicles.list('Active').then(setVehicles),
      api.warehouses.list().then(setWarehouses),
    ]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const searchLoad = async () => {
    if (!loadSearch.trim()) return;
    setSearching(true);
    try {
      const results = await api.loadings.search(loadSearch.trim());
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (load: any) => {
    setSelectedVehicle(load.vehicle_id || '');
    const normalized = {
      ...load,
      bookings: (load.bookings || []).map((b: any) => ({ ...b, booking_id: b.id, booking_no: b.booking_no, num_bags: b.num_bags })),
    };
    setSelectedLoad(normalized);
    const initial: Record<number, number> = {};
    (normalized.bookings || []).forEach((b: any) => {
      initial[b.booking_id] = b.num_bags ?? 0;
    });
    setBookingReceivings(initial);
    setVehicleLoads([normalized]);
    setLoadSearch('');
    setSearchResults([]);
    setShortageNotes({});
  };

  const handleVehicleChange = async (vehicleId: number | '') => {
    setSelectedVehicle(vehicleId);
    setSelectedLoad(null);
    setBookingReceivings({});
    setLoadSearch('');
    setSearchResults([]);
    if (vehicleId) {
      const loads = await api.receivings.loads(Number(vehicleId));
      setVehicleLoads(loads);
    } else {
      setVehicleLoads([]);
    }
  };

  const selectLoad = (load: any) => {
    setSelectedLoad(load);
    const initial: Record<number, number> = {};
    load.bookings.forEach((b: any) => {
      initial[b.booking_id] = b.num_bags ?? 0;
    });
    setBookingReceivings(initial);
    setShortageNotes({});
  };

  const updateReceivedBags = (bookingId: number, val: string) => {
    setBookingReceivings((prev) => ({ ...prev, [bookingId]: Number(val) || 0 }));
  };

  const saveReceiving = async () => {
    if (!selectedVehicle) { alert('Please select a vehicle'); return; }
    if (!selectedWarehouse) { alert('Please select a warehouse'); return; }
    if (!selectedLoad || !selectedLoad.bookings || selectedLoad.bookings.length === 0) { alert('No LRs to receive'); return; }

    const bookingItems = selectedLoad.bookings.map((b: any) => ({
      booking_id: b.booking_id,
      bags_received: bookingReceivings[b.booking_id] ?? 0,
      num_bags: b.num_bags ?? 0,
      notes: (b.num_bags ?? 0) - (bookingReceivings[b.booking_id] ?? 0) > 0
        ? (shortageNotes[b.booking_id] || `Short: ${(b.num_bags ?? 0) - (bookingReceivings[b.booking_id] ?? 0)} bags`)
        : '',
    }));

    await api.receivings.create({
      vehicle_id: selectedVehicle,
      warehouse_id: selectedWarehouse,
      receiving_date: receivingDate,
      driver_name: selectedLoad.driver_name,
      driver_phone: selectedLoad.driver_phone,
      license_number: selectedLoad.license_number,
      bookings: bookingItems,
    });

    setSelectedVehicle('');
    setSelectedWarehouse('');
    setVehicleLoads([]);
    setSelectedLoad(null);
    setBookingReceivings({});
    load();
  };

  const remove = async (id: number) => {
    if (confirm('Delete this receiving record?')) {
      await api.receivings.delete(id);
      load();
    }
  };

  const totalBags = (detail?.bookings || []).reduce((s: number, b: any) => s + (b.num_bags ?? 0), 0);
  const totalReceived = (detail?.bookings || []).reduce((s: number, b: any) => s + (b.bags_received ?? 0), 0);
  const totalShort = (detail?.bookings || []).reduce((s: number, b: any) => s + (b.short_bags ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Load Receiving</h1>
        </div>
      </div>

      {/* New Receiving Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Receive Vehicle Load</h2>

        {/* Search Load */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b dark:border-gray-700">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Search Load Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type loading number like LD-..."
                value={loadSearch}
                onChange={(e) => setLoadSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchLoad()}
                className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button onClick={searchLoad} disabled={searching} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Search Results</label>
            <div className="border dark:border-gray-600 rounded-lg divide-y">
              {searchResults.map((load) => (
                <div key={load.id} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <span className="font-mono font-medium">{load.loading_no}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-gray-600 dark:text-gray-300">{load.vehicle_reg || '-'}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span>{load.driver_name || '-'}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-xs text-gray-500">{load.loading_date ? new Date(load.loading_date).toLocaleDateString() : '-'}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-xs">{load.item_count} LRs</span>
                  </div>
                  <button onClick={() => selectSearchResult(load)} className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50">Select</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Vehicle *</label>
            <select value={selectedVehicle} onChange={(e) => handleVehicleChange(Number(e.target.value) || '')} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v.id} value={v.id!}>{v.reg_number} ({v.type})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Warehouse *</label>
            <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(Number(e.target.value) || '')} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select warehouse</option>
              {warehouses.map((w) => <option key={w.id} value={w.id!}>{w.code ? `${w.code} - ` : ''}{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Receiving Date</label>
            <input type="date" value={receivingDate} onChange={(e) => setReceivingDate(e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={saveReceiving} className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
              <Plus size={16} /> Complete Receiving
            </button>
          </div>
        </div>

        {/* Vehicle Loads */}
        {selectedVehicle && (
          <div>
            {vehicleLoads.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">No loaded LRs found for this vehicle. Load the vehicle first.</p>
            ) : (
              <div>
                {/* Select which load to receive */}
                {vehicleLoads.length > 1 && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Select Load Trip</label>
                    <div className="flex gap-2">
                      {vehicleLoads.map((load, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectLoad(load)}
                          className={`px-3 py-1.5 text-xs rounded-lg border ${
                            selectedLoad === load ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 text-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900'
                          }`}
                        >
                          {load.driver_name || 'Driver'} ({load.bookings.length} LRs)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(!selectedLoad && vehicleLoads.length === 1) && (
                  <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    <button onClick={() => selectLoad(vehicleLoads[0])} className="text-indigo-600 underline">Click to load trip details</button>
                  </div>
                )}

                {selectedLoad && (
                  <div>
                    {/* Driver Info */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3 text-xs text-gray-600 dark:text-gray-300 flex gap-4 flex-wrap">
                      <span><strong>Driver:</strong> {selectedLoad.driver_name || '-'}</span>
                      <span><strong>Phone:</strong> {selectedLoad.driver_phone || '-'}</span>
                      <span><strong>License:</strong> {selectedLoad.license_number || '-'}</span>
                      <span><strong>LRs:</strong> {selectedLoad.bookings.length}</span>
                    </div>

                    {/* LRs Table */}
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Enter Received Nags for each LR (expected nags shown)</label>
                    <div className="border dark:border-gray-600 rounded-lg">
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left py-2 px-3">LR #</th>
                    <th className="text-left py-2 px-3">Consignor</th>
                    <th className="text-left py-2 px-3">Consignee</th>
                    <th className="text-right py-2 px-3">Expected Nags</th>
                    <th className="text-right py-2 px-3">Received Nags</th>
                    <th className="text-right py-2 px-3">Short</th>
                    <th className="text-left py-2 px-3">Shortage Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedLoad.bookings.map((b: any) => {
                    const received = bookingReceivings[b.booking_id] ?? 0;
                    const short = (b.num_bags ?? 0) - received;
                    return (
                      <tr key={b.booking_id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 text-xs ${short > 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                        <td className="py-2 px-3 font-mono font-medium">{b.booking_no}</td>
                        <td className="py-2 px-3 max-w-[120px] truncate">{b.consignor_name || '-'}</td>
                        <td className="py-2 px-3 max-w-[120px] truncate">{b.consignee_name || '-'}</td>
                        <td className="py-2 px-3 text-right">{b.num_bags ?? '-'}</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={received}
                            onChange={(e) => updateReceivedBags(b.booking_id, e.target.value)}
                            className="w-20 border dark:border-gray-600 rounded px-2 py-1 text-xs text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                            min={0}
                          />
                        </td>
                        <td className={`py-2 px-3 text-right font-semibold ${short > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {short > 0 ? <span className="flex items-center justify-end gap-1"><AlertTriangle size={12} />{short}</span> : short}
                        </td>
                        <td className="py-2 px-3">
                          {short > 0 ? (
                            <input
                              type="text"
                              placeholder="Reason for shortage..."
                              value={shortageNotes[b.booking_id] || ''}
                              onChange={(e) => setShortageNotes((prev) => ({ ...prev, [b.booking_id]: e.target.value }))}
                              className="w-full border dark:border-gray-600 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-900 font-semibold text-xs">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-right">TOTAL:</td>
                            <td className="py-2 px-3 text-right">{selectedLoad.bookings.reduce((s: number, b: any) => s + (b.num_bags ?? 0), 0)}</td>
                            <td className="py-2 px-3 text-right">{Object.values(bookingReceivings).reduce((s: number, v) => s + v, 0)}</td>
                            <td className="py-2 px-3 text-right">{selectedLoad.bookings.reduce((s: number, b: any) => s + ((b.num_bags ?? 0) - (bookingReceivings[b.booking_id] ?? 0)), 0)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Receiving History */}
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Receiving History</h2>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-3 px-4">Receiving #</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Vehicle</th>
                <th className="text-left py-3 px-4">Driver</th>
                <th className="text-left py-3 px-4">Warehouse</th>
                <th className="text-left py-3 px-4">LRs</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {receivings.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900">
                  <td className="py-3 px-4 font-mono text-xs font-medium">{r.receiving_no}</td>
                  <td className="py-3 px-4 text-xs">{r.receiving_date ? new Date(r.receiving_date).toLocaleDateString() : '-'}</td>
                  <td className="py-3 px-4 font-medium">{r.vehicle_reg || '-'}</td>
                  <td className="py-3 px-4 text-xs">{r.driver_name || '-'}</td>
                  <td className="py-3 px-4 text-xs">{r.warehouse_name || '-'}</td>
                  <td className="py-3 px-4 text-xs">{r.item_count ?? 0}</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">{r.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => { api.receivings.get(r.id!).then(setDetail); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="View"><Eye size={14} className="text-gray-400 dark:text-gray-500" /></button>
                      <button onClick={() => { api.receivings.get(r.id!).then((d) => printReceivingSheet(d)); }} className="p-1 hover:bg-blue-50 rounded" title="Print Receiving Sheet"><Printer size={14} className="text-blue-400" /></button>
                      <button onClick={() => remove(r.id!)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {receivings.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400 dark:text-gray-500">No receivings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Goods Received Note: ${detail?.receiving_no || ''}`} wide>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-400 dark:text-gray-500">Vehicle:</span> <span className="font-medium">{detail.vehicle_reg}</span></div>
              <div><span className="text-gray-400 dark:text-gray-500">Driver:</span> {detail.driver_name || '-'}</div>
              <div><span className="text-gray-400 dark:text-gray-500">License:</span> {detail.license_number || '-'}</div>
              <div><span className="text-gray-400 dark:text-gray-500">Date:</span> {detail.receiving_date ? new Date(detail.receiving_date).toLocaleDateString() : '-'}</div>
              <div><span className="text-gray-400 dark:text-gray-500">Warehouse:</span> {detail.warehouse_name || '-'}</div>
            </div>
            <div className="border dark:border-gray-600 rounded-lg">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left py-2 px-3">LR #</th>
                    <th className="text-left py-2 px-3">Consignor</th>
                    <th className="text-left py-2 px-3">Consignee</th>
                    <th className="text-right py-2 px-3">Expected Nags</th>
                    <th className="text-right py-2 px-3">Received Nags</th>
                    <th className="text-right py-2 px-3">Short</th>
                    <th className="text-left py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(detail.bookings || []).map((b: any) => {
                    const short = b.short_bags ?? 0;
                    return (
                      <tr key={b.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 text-xs ${short > 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                        <td className="py-2 px-3 font-mono font-medium">{b.booking_no}</td>
                        <td className="py-2 px-3 max-w-[120px] truncate">{b.consignor_name || '-'}</td>
                        <td className="py-2 px-3 max-w-[120px] truncate">{b.consignee_name || '-'}</td>
                        <td className="py-2 px-3 text-right">{b.num_bags ?? '-'}</td>
                        <td className="py-2 px-3 text-right">{b.bags_received ?? '-'}</td>
                        <td className={`py-2 px-3 text-right font-semibold ${short > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {short > 0 ? <span className="flex items-center justify-end gap-1"><AlertTriangle size={12} />{short}</span> : short}
                        </td>
                        <td className="py-2 px-3 text-xs">{b.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900 font-semibold text-xs">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right">TOTAL:</td>
                    <td className="py-2 px-3 text-right">{totalBags}</td>
                    <td className="py-2 px-3 text-right">{totalReceived}</td>
                    <td className={`py-2 px-3 text-right ${totalShort > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {totalShort > 0 ? <span className="flex items-center justify-end gap-1"><AlertTriangle size={12} />{totalShort}</span> : totalShort}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={() => printReceivingSheet(detail)} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm">
                <Printer size={16} /> Print Goods Received Note
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
