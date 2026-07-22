import { useState, useRef, useCallback } from 'react';
import { Camera, Scan, CheckSquare, ClipboardCheck, Loader2, Barcode } from 'lucide-react';
import Modal from './Modal';

export default function POD() {
  const [podSearch, setPodSearch] = useState('');
  const [podResults, setPodResults] = useState<any[]>([]);
  const [podSelected, setPodSelected] = useState<Record<number, string>>({});
  const [podSubmitting, setPodSubmitting] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileKeys, setFileKeys] = useState<Record<number, number>>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<any>(null);
  const searchTimer = useRef<any>(null);


  const search = async (q?: string) => {
    const term = q ?? podSearch;
    if (!term.trim()) return;
    setLoading(true);
    setMsg('');
    const r = await fetch(`/api/deliveries/pod/search?q=${encodeURIComponent(term)}`).then(r => r.json());
    setPodResults(r);
    setLoading(false);
  };

  const capturePhoto = (bookingId: number, file: File) => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const maxW = 1024, maxH = 768;
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) { const r = Math.min(maxW / w, maxH / h); w *= r; h *= r; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      setPodSelected((prev) => ({ ...prev, [bookingId]: c.toDataURL('image/jpeg', 0.7) }));
      setFileKeys((prev) => ({ ...prev, [bookingId]: (prev[bookingId] || 0) + 1 }));
    };
    img.src = URL.createObjectURL(file);
  };

  const removePhoto = (bookingId: number) => {
    setPodSelected((prev) => {
      const n = { ...prev };
      delete n[bookingId];
      return n;
    });
  };

  const startScanner = async () => {
    setScannerOpen(true);
    setTimeout(async () => {
      const el = document.getElementById('barcode-scanner');
      if (!el) return;
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-scanner');
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 100 } },
        (text: string) => {
          stopScanner();
          setPodSearch(text);
          setTimeout(() => {
            const el = document.querySelector<HTMLButtonElement>('[data-pod-search]');
            el?.click();
          }, 100);
        },
        () => {}
      ).catch(() => {});
    }, 300);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScannerOpen(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardCheck className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Proof of Delivery</h1>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <CheckSquare size={16} /> {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Scan barcode or type Delivery/LR number</label>
            <div className="relative">
              <Scan size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="e.g. DLV-... or PT-..." value={podSearch} onChange={(e) => { const v = e.target.value; setPodSearch(v); if (searchTimer.current) clearTimeout(searchTimer.current); if (v.trim()) { searchTimer.current = setTimeout(() => search(v), 300); } else { setPodResults([]); } }} className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <button onClick={startScanner} className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-1.5" title="Scan barcode"><Barcode size={15} /></button>
          <button onClick={search} data-pod-search disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-1.5 disabled:opacity-50"><Scan size={15} /> {loading ? 'Searching...' : 'Search'}</button>
        </div>

        {podResults.length === 0 && podSearch && !loading && (
          <p className="text-sm text-gray-400 text-center py-6 border rounded-lg bg-gray-50">No out-for-delivery deliveries found</p>
        )}

        {podResults.map((del) => (
          <div key={del.id} className="border rounded-lg mb-4 last:mb-0 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm">
                <span className="font-semibold text-gray-800">{del.delivery_no}</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-gray-600">{del.delivery_person_name || '-'}</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="text-gray-500 text-xs">{del.delivery_date ? new Date(del.delivery_date).toLocaleDateString() : '-'}</span>
              </div>
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">{del.bookings?.length || 0} LRs</span>
            </div>
            {(del.bookings || []).map((b: any) => {
              const hasPhoto = !!podSelected[b.id];
              const photoData = podSelected[b.id];
              return (
                <div key={b.id} className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${hasPhoto ? 'bg-green-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{b.booking_no}</p>
                    <p className="text-xs text-gray-500 truncate">{b.consignee_name || '-'} {b.consignee_contact ? `• ${b.consignee_contact}` : ''}</p>
                    <p className="text-[11px] text-gray-400 truncate">{b.consignee_address || '-'}</p>
                    <p className="text-[11px] text-gray-400">{b.from_location || '-'} → {b.to_location || '-'} {b.num_bags ? `• ${b.num_bags} nags` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasPhoto && (
                      <img src={photoData} alt="POD" className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                    )}
                    <label className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${hasPhoto ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      <Camera size={13} />
                      Camera
                      <input key={`cam-${fileKeys[b.id] || 0}`} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) capturePhoto(b.id, f); }} />
                    </label>
                    <label className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${hasPhoto ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      <Camera size={13} />
                      Upload
                      <input key={`up-${fileKeys[b.id] || 0}`} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) capturePhoto(b.id, f); }} />
                    </label>
                    {hasPhoto && (
                      <>
                        <button onClick={() => setViewPhoto(photoData)} className="text-xs text-indigo-600 hover:text-indigo-800 px-1.5 py-1 rounded hover:bg-indigo-50">View</button>
                        <button onClick={() => removePhoto(b.id)} className="text-xs text-red-500 hover:text-red-700 px-1.5 py-1 rounded hover:bg-red-50">Remove</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {del.bookings?.some((b: any) => podSelected[b.id]) && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={async () => {
                  if (podSubmitting) return;
                  setPodSubmitting(true);
                  setMsg('');
                  const bookingIds = Object.keys(podSelected).map(Number);
                  const res = await fetch(`/api/deliveries/${del.id}/confirm`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delivered_ids: bookingIds, pod_photos: podSelected }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setMsg(`${Object.keys(podSelected).length} LR(s) marked as delivered successfully`);
                    const remaining = (del.bookings || []).filter((b: any) => !podSelected[b.id]);
                    if (remaining.length === 0) {
                      setPodResults((prev) => prev.filter((d) => d.id !== del.id));
                    }
                    setPodSelected({});
                  } else {
                    const err = await res.json().catch(() => ({ error: 'Failed to confirm delivery' }));
                    setMsg(''); 
                    alert(err.error || 'Failed to confirm delivery');
                  }
                  setPodSubmitting(false);
                }} disabled={podSubmitting} className="flex items-center gap-1.5 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
                  {podSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckSquare size={16} />} {podSubmitting ? 'Submitting...' : `Mark ${Object.keys(podSelected).length} LR(s) Delivered`}
                </button>
              </div>
            )}
          </div>
        ))}

        {podResults.length > 0 && (
          <div className="text-center py-2">
            <button onClick={() => { setPodResults([]); setPodSearch(''); setPodSelected({}); setMsg(''); }} className="text-xs text-gray-400 hover:text-gray-600">Clear results</button>
          </div>
        )}
      </div>

      {viewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setViewPhoto(null)}>
          <div className="relative max-w-lg w-full mx-3" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewPhoto(null)} className="absolute -top-8 right-0 text-white/60 hover:text-white text-sm">Close</button>
            <img src={viewPhoto} alt="POD" className="w-full rounded-lg shadow-2xl" />
          </div>
        </div>
      )}

      <Modal open={scannerOpen} onClose={stopScanner} title="Scan Barcode">
        <div className="flex flex-col items-center gap-3">
          <div id="barcode-scanner" className="w-full max-w-sm aspect-[3/2] bg-gray-900 rounded-lg overflow-hidden" />
          <p className="text-xs text-gray-500">Point camera at the barcode on the LRR</p>
          <button onClick={stopScanner} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
