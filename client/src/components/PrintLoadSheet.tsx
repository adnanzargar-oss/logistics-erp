import { Loading } from '../types';

function toTitleCase(s: string): string {
  if (!s) return '-';
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

const COMPANY = {
  name: 'Planet Transport Pvt Ltd.',
  regdOffice: 'Tengpora, Byepass Srinagar-190010',
  phone: '9419428505, 9906661400',
};

function loadSheetHTML(loading: Loading): string {
  const bookings = loading.bookings || [];
  const totalBags = bookings.reduce((s, b) => s + (b.num_bags ?? 0), 0);
  const totalWeight = bookings.reduce((s, b) => s + (b.charged_weight ?? b.actual_weight ?? 0), 0);
  const rows = bookings.map((b) => `
    <tr>
      <td>${b.booking_no || '-'}</td>
      <td>${toTitleCase(b.consignor_name || '')}</td>
      <td>${toTitleCase(b.consignee_name || '')}</td>
      <td class="r">${b.num_bags ?? '-'}</td>
      <td class="r">${(b.charged_weight ?? b.actual_weight ?? '-')} kg</td>
      <td>${b.eway_bill_no || '-'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Load Sheet - ${loading.loading_no}</title>
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
  .sheet-badge { background: #dc2626; color: #fff; padding: 6px 20px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; border-radius: 4px; display: inline-block; }

  /* Info Grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border: 1.2px solid #e5e7eb; border-radius: 4px; padding: 6px 10px; margin-bottom: 8px; font-size: 12px; background: #fafafa; }
  .info-grid .label { color: #666; font-weight: 600; }
  .info-grid .val { font-weight: 600; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  td, th { border: 1.2px solid #e5e7eb; padding: 4px 8px; }
  th { background: #dc2626; color: #fff; font-size: 11px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; padding: 5px; }
  td { font-size: 12px; }
  .r { text-align: right; }
  tfoot td { font-weight: 700; background: #fef2f2; border-top: 2px solid #dc2626; font-size: 13px; }

  /* Signatures */
  .signatures { display: flex; justify-content: space-between; margin-top: 8px; gap: 14px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-line { border-top: 1.5px solid #444; padding-top: 2px; margin-bottom: 2px; min-height: 35px; }
  .sig-box span { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.3px; }

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
      <div class="sheet-badge">LOAD SHEET</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div><span class="label">Loading No:</span> <span class="val">${loading.loading_no}</span></div>
    <div><span class="label">Date:</span> ${loading.loading_date ? new Date(loading.loading_date).toLocaleDateString('en-IN') : '-'}</div>
    <div><span class="label">Vehicle:</span> <span class="val">${loading.vehicle_reg || '-'}</span></div>
    <div><span class="label">Driver:</span> <span class="val">${toTitleCase(loading.driver_name || '')}</span></div>
    <div><span class="label">License No:</span> ${loading.license_number || '-'}</div>
    <div style="background:#dc2626;color:#fff;border-radius:4px;padding:3px 6px;"><span class="label" style="color:#fff;">Total LRs:</span> <span class="val" style="color:#fff;">${bookings.length}</span></div>
  </div>

  <!-- Table -->
  <table>
    <thead>
      <tr>
        <th>LR No</th>
        <th>Consignor</th>
        <th>Consignee</th>
        <th>Items</th>
        <th>Weight</th>
        <th>E-Way Bill</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#999;">No items loaded</td></tr>'}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="r">TOTAL</td>
        <td class="r">${totalBags}</td>
        <td class="r">${totalWeight} kg</td>
        <td></td>
      </tr>
    </tfoot>
  </table>


  <div class="signatures">
    <div class="sig-box"><div class="sig-line"></div><span>Loaded by (Signature)</span></div>
    <div class="sig-box"><div class="sig-line"></div><span>Driver Signature</span></div>
    <div class="sig-box"><div class="sig-line"></div><span>Transport Manager</span></div>
  </div>

</div>

</body>
</html>`;
}

export function printLoadSheet(loading: Loading) {
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow popups for printing.'); return; }
  win.document.write(loadSheetHTML(loading));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
