import { useState, useEffect } from 'react';
import { api } from '../api';
import { Booking } from '../types';
import { Printer, Search } from 'lucide-react';
import JsBarcode from 'jsbarcode';

function generateBarcodeSVG(value: string): string {
 const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 JsBarcode(svg, value, { format: 'CODE128', width: 0.8, height: 12, displayValue: true, fontSize: 7, textMargin: 1, margin: 0 });
 return svg.outerHTML;
}

function printBarcodes(booking: Booking) {
 const nags = booking.num_bags ?? 0;
 if (nags < 1) { alert('No bags to print barcodes for.'); return; }

 const barcodes: string[] = [];
 for (let i = 1; i <= nags; i++) {
 barcodes.push(`${booking.booking_no}-${String(i).padStart(3, '0')}`);
 }

 const win = window.open('', '_blank');
 if (!win) { alert('Please allow popups for printing.'); return; }

 const pagesHTML = barcodes.map((code) => {
 const svg = generateBarcodeSVG(code);
 return `<div class="label-page"><div class="label-info">${booking.booking_no} | ${booking.from_location || '-'} → ${booking.to_location || '-'}</div>${svg}<div class="label-text">${code}</div></div>`;
 }).join('');

 const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Barcodes - ${booking.booking_no}</title>
<style>
 @page {
 size: 50mm 25mm;
 margin: 0;
 }
 * { box-sizing: border-box; margin: 0; padding: 0; }
 body {
 font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
 }

 .label-page {
 width: 50mm;
 height: 25mm;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 padding: 1mm 2mm;
 page-break-after: always;
 overflow: hidden;
 }

 .label-page svg {
 width: 44mm;
 height: auto;
 max-height: 15mm;
 }

 .label-text {
 font-family: 'Courier New', monospace;
 font-size: 7px;
 font-weight: 600;
 color: #222;
 letter-spacing: 0.5px;
 text-align: center;
 white-space: nowrap;
 margin-top: 1px;
 }

 .label-info {
 font-size: 6px;
 color: #666;
 text-align: center;
 white-space: nowrap;
 overflow: hidden;
 text-overflow: ellipsis;
 max-width: 44mm;
 line-height: 1.2;
 }

 @media print {
 body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
 .label-page { page-break-after: always; }
 }
</style>
</head>
<body>
 ${pagesHTML}
</body>
</html>`;

 win.document.write(html);
 win.document.close();
 win.focus();
 setTimeout(() => win.print(), 500);
}

export default function BarcodePrint() {
 const [bookings, setBookings] = useState<Booking[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');

 useEffect(() => {
 api.bookings.list().then((data) => {
 setBookings(data);
 setLoading(false);
 }).catch(() => setLoading(false));
 }, []);

 const filtered = bookings.filter((b) =>
 (b.num_bags ?? 0) > 0 &&
 (!search ||
 b.booking_no?.toLowerCase().includes(search.toLowerCase()) ||
 b.consignor_name?.toLowerCase().includes(search.toLowerCase()) ||
 b.consignee_name?.toLowerCase().includes(search.toLowerCase()))
 );

 return (
 <div className="p-4 max-w-6xl mx-auto">
 <div className="flex items-center justify-between mb-4">
 <h1 className="text-xl font-bold text-gray-800 ">Nag Barcode Printing</h1>
 </div>

 <div className="relative mb-4">
 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
 <input
 type="text"
 placeholder="Search by LR No, Consignor or Consignee..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm "
 />
 </div>

 {loading ? (
 <div className="text-center py-8 text-gray-500">Loading bookings...</div>
 ) : filtered.length === 0 ? (
 <div className="text-center py-8 text-gray-500">
 {search ? 'No bookings match your search.' : 'No bookings with bags found.'}
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-gray-100 text-gray-600 ">
 <th className="text-left p-3 font-semibold">LR No</th>
 <th className="text-left p-3 font-semibold">Consignor</th>
 <th className="text-left p-3 font-semibold">Consignee</th>
 <th className="text-left p-3 font-semibold">From → To</th>
 <th className="text-center p-3 font-semibold">Nags</th>
 <th className="text-center p-3 font-semibold">Action</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((b) => (
 <tr key={b.id} className="border-b hover:bg-gray-50 :bg-gray-750">
 <td className="p-3 font-medium text-gray-800 ">{b.booking_no}</td>
 <td className="p-3 text-gray-600 ">{b.consignor_name || '-'}</td>
 <td className="p-3 text-gray-600 ">{b.consignee_name || '-'}</td>
 <td className="p-3 text-gray-600 ">{(b.from_location || '-')} → {(b.to_location || '-')}</td>
 <td className="p-3 text-center font-bold text-blue-600 ">{b.num_bags}</td>
 <td className="p-3 text-center">
 <button
 onClick={() => printBarcodes(b)}
 className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-xs"
 >
 <Printer size={14} /> Print Barcodes
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 );
}
