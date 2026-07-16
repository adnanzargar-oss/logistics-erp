import { useState, useEffect } from 'react';
import { api } from '../api';
import { ChevronLeft, ChevronRight, PackageCheck, ArrowDownToLine, Package, X, Printer } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalendarEvent = {
 date: string;
 type: 'loading' | 'receiving' | 'delivery';
 ref: string;
 id: number;
 vehicle: string;
 location: string;
 lrs: number;
 detail: string;
};

export default function Calendar() {
 const now = new Date();
 const [year, setYear] = useState(now.getFullYear());
 const [month, setMonth] = useState(now.getMonth());
 const [events, setEvents] = useState<CalendarEvent[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedDay, setSelectedDay] = useState<CalendarEvent[] | null>(null);
 const [filters, setFilters] = useState({ loading: true, receiving: true, delivery: true });

 useEffect(() => {
 Promise.all([
 api.loadings.list(),
 api.receivings.list(),
 api.deliveries.list(),
 ]).then(([loadings, receivings, deliveries]) => {
 const all: CalendarEvent[] = [];

 (loadings as any[]).forEach((l) => {
 if (l.loading_date) {
 all.push({
 date: l.loading_date.split('T')[0],
 type: 'loading',
 ref: l.loading_no,
 id: l.id,
 vehicle: l.vehicle_reg || '-',
 location: `${(l.bookings?.[0]?.from_location || '')} → ${(l.bookings?.[0]?.to_location || '')}`,
 lrs: l.item_count || 0,
 detail: `${l.vehicle_reg || 'Vehicle'} | ${l.item_count || 0} LRs`,
 });
 }
 });

 (receivings as any[]).forEach((r) => {
 if (r.receiving_date) {
 all.push({
 date: r.receiving_date.split('T')[0],
 type: 'receiving',
 ref: r.receiving_no,
 id: r.id,
 vehicle: r.vehicle_reg || '-',
 location: r.warehouse_name || '-',
 lrs: r.item_count || 0,
 detail: `${r.vehicle_reg || ''} → ${r.warehouse_name || ''} | ${r.item_count || 0} LRs`,
 });
 }
 });

 (deliveries as any[]).forEach((d) => {
 if (d.delivery_date) {
 all.push({
 date: d.delivery_date.split('T')[0],
 type: 'delivery',
 ref: d.delivery_no,
 id: d.id,
 vehicle: d.delivery_person_vehicle || '-',
 location: d.delivery_person_name || '-',
 lrs: d.item_count || 0,
 detail: `${d.delivery_person_name || 'Person'} | ${d.item_count || 0} LRs`,
 });
 }
 });

 setEvents(all);
 setLoading(false);
 }).catch(() => setLoading(false));
 }, []);

 const firstDay = new Date(year, month, 1).getDay();
 const daysInMonth = new Date(year, month + 1, 0).getDate();
 const today = new Date().toISOString().split('T')[0];

 const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
 const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

 const filteredEvents = events.filter(e => filters[e.type]);

 const getEventsForDay = (day: number): CalendarEvent[] => {
 const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
 return filteredEvents.filter(e => e.date === dateStr);
 };

 const toggleFilter = (type: 'loading' | 'receiving' | 'delivery') => {
 setFilters(f => ({ ...f, [type]: !f[type] }));
 };

 const typeColor = (type: string) => {
 switch (type) {
 case 'loading': return 'bg-green-500';
 case 'receiving': return 'bg-blue-500';
 case 'delivery': return 'bg-orange-500';
 default: return 'bg-gray-400';
 }
 };

 const typeIcon = (type: string) => {
 switch (type) {
 case 'loading': return <PackageCheck size={14} className="text-green-600" />;
 case 'receiving': return <ArrowDownToLine size={14} className="text-blue-600" />;
 case 'delivery': return <Package size={14} className="text-orange-600" />;
 default: return null;
 }
 };

 const typeLabel = (type: string) => {
 switch (type) {
 case 'loading': return 'Loading';
 case 'receiving': return 'Receiving';
 case 'delivery': return 'Delivery';
 default: return type;
 }
 };

 const printDay = (dayEvents: CalendarEvent[]) => {
 const dateStr = dayEvents[0]?.date || '';
 const formattedDate = dateStr ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

 const groups: { type: string; label: string; events: CalendarEvent[] }[] = [
 { type: 'loading', label: 'Loading', events: dayEvents.filter(e => e.type === 'loading') },
 { type: 'receiving', label: 'Receiving', events: dayEvents.filter(e => e.type === 'receiving') },
 { type: 'delivery', label: 'Delivery', events: dayEvents.filter(e => e.type === 'delivery') },
 ];

 const sectionsHTML = groups.map(g => {
 if (g.events.length === 0) return '';
 return `
 <div class="section">
 <div class="section-header">
 ${g.label} (${g.events.length})
 </div>
 <table class="data-table">
 <thead>
 <tr>
 <th>#</th>
 <th>Ref No</th>
 <th>Vehicle</th>
 <th>${g.type === 'loading' ? 'Route' : g.type === 'receiving' ? 'Warehouse' : 'Person'}</th>
 <th>LRs</th>
 </tr>
 </thead>
 <tbody>
 ${g.events.map((e, i) => `
 <tr>
 <td>${i + 1}</td>
 <td><strong>${e.ref}</strong></td>
 <td>${e.vehicle}</td>
 <td>${e.location}</td>
 <td>${e.lrs}</td>
 </tr>
 `).join('')}
 </tbody>
 </table>
 </div>
 `;
 }).join('');

 const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Movement Chart - ${dateStr}</title>
<style>
 @page { size: A4; margin: 6mm; }
 * { box-sizing: border-box; margin: 0; padding: 0; }
 body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: #1a1a1a; }
 .mc-page { padding: 8px 0; position: relative; }
 .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 340px; opacity: 0.08; pointer-events: none; z-index: 0; }

 /* Header */
 .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #dc2626; }
 .brand { display: flex; align-items: center; gap: 10px; }
 .logo { width: 120px; height: auto; flex-shrink: 0; }
 .header-left h1 { font-size: 24px; color: #dc2626; margin: 0; font-weight: 800; letter-spacing: -0.3px; line-height: 1.1; }
 .header-detail { font-size: 12px; color: #666; }
 .header-phones { display: flex; gap: 14px; margin-top: 2px; font-size: 12px; color: #dc2626; font-weight: 600; }
 .header-right { text-align: center; }
 .header-right .mc-title { background: #fef2f2; border: 1.5px solid #dc2626; border-radius: 6px; padding: 6px 18px; }
 .mc-title .mc-label { font-size: 10px; text-transform: uppercase; color: #dc2626; font-weight: 600; letter-spacing: 0.3px; }
 .mc-title .mc-value { font-size: 14px; font-weight: 700; color: #1a1a1a; }

 /* Section */
 .section-header { background: #dc2626; color: #fff; padding: 4px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; border-radius: 3px; }

 /* Data Tables */
 .data-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
 .data-table td, .data-table th { border: 1.2px solid #e5e7eb; padding: 4px 8px; }
 .data-table th { background: #dc2626; color: #fff; font-size: 11px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.3px; padding: 4px; }
 .data-table td { font-size: 12px; color: #1a1a1a; }
 .data-table tr:nth-child(even) td { background: #fafafa; }

 /* Summary */
 .summary { display: flex; gap: 10px; margin-top: 8px; }
 .summary-item { flex: 1; text-align: center; padding: 6px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }

 /* Footer */
 .footer { text-align: center; font-size: 10px; color: #999; margin-top: 12px; padding-top: 6px; border-top: 1px solid #eee; }

 @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
 <div class="mc-page">
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
 <path fill="#fff" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24Z"/>
 <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
 <path fill="#ef453c" d="M384.85,123.81c-105.54-59.71-71.07-55.18-96.98,51.24-23.07,5.13,13.72-74.92,1.41-90.6-28.87-6.73-59.97-14.9-89.33-7.12-61.65,20.38-14.75,23.91,18.31,28.69-2.86,6.9-5.62,13.56-8.4,20.27-28.57-7.57-60.43-16.41-87.79-.38-10.15-1.73-20.52-11.45-29.76-17.08-3.81-2.51,1.93-3.81,1.39-7.01,47.27-143.49,264.07-127.22,291.16,21.99Z"/>
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
 <div class="mc-title">
 <div class="mc-label">Movement Chart</div>
 <div class="mc-value">${formattedDate}</div>
 </div>
 </div>
 </div>

 ${sectionsHTML}

 <div class="summary">
 <div class="summary-item" style="background:#fef2f2;color:#dc2626;">${groups[0].events.length} Loading${groups[0].events.length !== 1 ? 's' : ''}</div>
 <div class="summary-item" style="background:#fef2f2;color:#dc2626;">${groups[1].events.length} Receiving${groups[1].events.length !== 1 ? 's' : ''}</div>
 <div class="summary-item" style="background:#fef2f2;color:#dc2626;">${groups[2].events.length} Deliver${groups[2].events.length !== 1 ? 'ies' : 'y'}</div>
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

 const cells: React.ReactNode[] = [];
 for (let i = 0; i < firstDay; i++) {
 cells.push(<div key={`empty-${i}`} className="p-1" />);
 }
 for (let d = 1; d <= daysInMonth; d++) {
 const dayEvents = getEventsForDay(d);
 const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
 const isToday = dateStr === today;
 cells.push(
 <div
 key={d}
 onClick={() => dayEvents.length > 0 && setSelectedDay(dayEvents)}
 className={`p-1 min-h-[70px] border border-gray-200 rounded cursor-pointer transition-colors ${
 isToday ? 'bg-indigo-50 border-indigo-300 ' : 'hover:bg-gray-50 :bg-gray-800'
 }`}
 >
 <div className={`text-xs font-semibold mb-0.5 ${isToday ? 'text-indigo-600 ' : 'text-gray-500 '}`}>{d}</div>
 <div className="flex flex-col gap-0.5">
 {dayEvents.slice(0, 3).map((e, i) => (
 <div key={i} className={`${typeColor(e.type)} text-white text-[9px] px-1 py-[1px] rounded truncate font-medium`}>
 {e.type === 'loading' ? 'LD' : e.type === 'receiving' ? 'RC' : 'DL'} {e.ref.slice(-6)}
 </div>
 ))}
 {dayEvents.length > 3 && (
 <div className="text-[9px] text-gray-400 font-medium px-1">+{dayEvents.length - 3} more</div>
 )}
 </div>
 </div>
 );
 }

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64 text-gray-500">Loading calendar...</div>
 );
 }

 return (
 <div className="p-4 max-w-6xl mx-auto">
 <div className="flex items-center justify-between mb-4">
 <h1 className="text-xl font-bold text-gray-800 ">Operations Calendar</h1>
 <div className="flex items-center gap-2">
 {(['loading', 'receiving', 'delivery'] as const).map(t => (
 <button
 key={t}
 onClick={() => toggleFilter(t)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
 filters[t]
 ? `${typeColor(t)} text-white`
 : 'bg-gray-100 text-gray-400 '
 }`}
 >
 <span className={`w-2 h-2 rounded-full ${filters[t] ? 'bg-white/80' : typeColor(t)}`} />
 {t === 'loading' ? 'Loading' : t === 'receiving' ? 'Receiving' : 'Delivery'}
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center justify-between mb-3">
 <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 :bg-gray-800 text-gray-600 ">
 <ChevronLeft size={20} />
 </button>
 <span className="text-lg font-bold text-gray-800 ">{MONTHS[month]} {year}</span>
 <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 :bg-gray-800 text-gray-600 ">
 <ChevronRight size={20} />
 </button>
 </div>

 <div className="grid grid-cols-7 mb-1">
 {DAYS.map(d => (
 <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-1">
 {cells}
 </div>

 {/* Clickable Summary strip */}
 <div className="mt-4 grid grid-cols-3 gap-4 text-center">
 {(['loading', 'receiving', 'delivery'] as const).map(t => (
 <button
 key={t}
 onClick={() => toggleFilter(t)}
 className={`rounded-lg p-3 transition-all ${
 filters[t]
 ? `${typeColor(t).replace('bg-', 'bg-').replace('-500', '-50')} ${typeColor(t).replace('bg-', 'bg-').replace('-500', '-900/20')}`
 : 'bg-gray-50 opacity-50'
 }`}
 >
 <div className={`text-lg font-bold ${filters[t] ? typeColor(t).replace('bg-', 'text-') : 'text-gray-400'}`}>
 {filteredEvents.filter(e => e.type === t).length}
 </div>
 <div className={`text-xs ${filters[t] ? 'text-gray-600 ' : 'text-gray-400'}`}>
 {t === 'loading' ? 'Loadings' : t === 'receiving' ? 'Receivings' : 'Deliveries'}
 </div>
 </button>
 ))}
 </div>

 {/* Day detail modal */}
 {selectedDay && (
 <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelectedDay(null)}>
 <div className="absolute inset-0 bg-black/40" />
 <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
 <div className="flex items-center justify-between p-4 border-b ">
 <h2 className="font-bold text-gray-800 ">
 {selectedDay[0]?.date ? new Date(selectedDay[0].date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
 </h2>
 <div className="flex items-center gap-1">
 <button onClick={() => printDay(selectedDay)} className="p-1.5 hover:bg-gray-100 :bg-gray-700 rounded text-gray-400 hover:text-indigo-600">
 <Printer size={16} />
 </button>
 <button onClick={() => setSelectedDay(null)} className="p-1.5 hover:bg-gray-100 :bg-gray-700 rounded">
 <X size={18} className="text-gray-500" />
 </button>
 </div>
 </div>
 <div className="p-4 overflow-y-auto max-h-[65vh] space-y-3">
 {(['loading', 'receiving', 'delivery'] as const).map(t => {
 const group = selectedDay.filter(e => e.type === t);
 if (group.length === 0) return null;
 return (
 <div key={t}>
 <div className="flex items-center gap-2 mb-2">
 {typeIcon(t)}
 <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
 {typeLabel(t)} ({group.length})
 </span>
 </div>
 <div className="space-y-2">
 {group.map((evt, i) => (
 <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 ">
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between">
 <span className="text-sm font-semibold text-gray-800 ">{evt.ref}</span>
 <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${typeColor(t)}`}>
 {t === 'loading' ? 'LD' : t === 'receiving' ? 'RC' : 'DL'}
 </span>
 </div>
 {t === 'loading' && (
 <div className="text-xs text-gray-500 mt-1 space-y-0.5">
 <div>Vehicle: {evt.vehicle}</div>
 <div>Route: {evt.location}</div>
 <div>LRs: {evt.lrs}</div>
 </div>
 )}
 {t === 'receiving' && (
 <div className="text-xs text-gray-500 mt-1 space-y-0.5">
 <div>Vehicle: {evt.vehicle}</div>
 <div>Warehouse: {evt.location}</div>
 <div>LRs: {evt.lrs}</div>
 </div>
 )}
 {t === 'delivery' && (
 <div className="text-xs text-gray-500 mt-1 space-y-0.5">
 <div>Delivery Person: {evt.location}</div>
 <div>Vehicle: {evt.vehicle}</div>
 <div>LRs: {evt.lrs}</div>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
