import { useState } from 'react';
import { Search, X, FileText, ImageIcon, XCircle } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

interface LRRRecord {
  id: number;
  booking_no: string;
  created_at: string;
  consignor_name: string | null;
  consignee_name: string | null;
  from_location: string | null;
  to_location: string | null;
  status: string;
  loading_no: string | null;
  loading_date: string | null;
  receiving_no: string | null;
  receiving_date: string | null;
  warehouse_name: string | null;
  delivery_no: string | null;
  delivery_date: string | null;
  pod_photo: string | null;
}

export default function LRSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LRRRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  const search = async () => {
    const q = query.trim().toUpperCase();
    if (!q) return;
    setBusy(true);
    try {
      const res = await fetch(`${BASE}/lrr-search?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    } catch { setResults([]); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">LRR Search</h1>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 max-w-md">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input value={query} onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search by LR#, consignor, consignee..."
          className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400" />
        {query && <button onClick={() => { setQuery(''); setResults([]); }} className="p-0.5 hover:bg-gray-200 rounded"><X size={14} className="text-gray-400" /></button>}
        <button onClick={search} disabled={busy || !query.trim()}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 shrink-0">
          {busy ? '...' : 'Search'}
        </button>
      </div>

      {results.length === 0 && !busy && (
        <div className="text-center py-16 text-sm text-gray-400">
          <FileText size={40} className="mx-auto mb-3 text-gray-200" />
          {query ? 'No LRRs found' : 'Enter an LR number to search'}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium">LR #</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">From</th>
                <th className="text-left py-3 px-4 font-medium">To</th>
                <th className="text-left py-3 px-4 font-medium">Loading #</th>
                <th className="text-left py-3 px-4 font-medium">Receiving #</th>
                <th className="text-left py-3 px-4 font-medium">Delivery #</th>
                <th className="text-center py-3 px-4 font-medium">POD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-medium text-gray-800">{r.booking_no}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{r.from_location || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{r.to_location || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">{r.loading_no || '-'}</td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    {r.receiving_no ? (
                      <span>{r.receiving_no}{r.warehouse_name ? <span className="text-gray-400"> ({r.warehouse_name})</span> : ''}</span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{r.delivery_no || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    {r.pod_photo ? (
                      <button onClick={() => setPhotoModal(r.pod_photo!)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        <ImageIcon size={14} /> View
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {photoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPhotoModal(null)}>
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPhotoModal(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md z-10 hover:bg-gray-100">
              <XCircle size={20} className="text-gray-600" />
            </button>
            <img src={photoModal} alt="POD" className="w-full rounded-lg shadow-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
