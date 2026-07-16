import { useEffect, useState, useRef } from 'react';
import { Download, Upload, ArrowDownToLine, FileDown, FileUp, Database, Check, AlertCircle } from 'lucide-react';
import Modal from './Modal';

interface EntityInfo {
  id: string;
  label: string;
  columns: string[];
  dateField: string | null;
  statusField: string | null;
}

export default function DataIO() {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [entities, setEntities] = useState<EntityInfo[]>([]);
  const [selEntity, setSelEntity] = useState('');

  const loadEntities = async () => {
    const list = await (await fetch('/api/dataio/entities')).json();
    setEntities(list);
    if (list.length > 0 && !selEntity) setSelEntity(list[0].id);
  };
  useEffect(() => { loadEntities(); }, []);

  const entity = entities.find((e) => e.id === selEntity);

  /* ── Export ── */
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const doExport = async () => {
    if (!selEntity) return;
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    const res = await fetch(`/api/dataio/export/${selEntity}${qs ? `?${qs}` : ''}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selEntity}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doDownloadSample = async () => {
    if (!selEntity) return;
    const res = await fetch(`/api/dataio/sample/${selEntity}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selEntity}-sample.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Import ── */
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [colMap, setColMap] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"(.*)"$/, '$1'));
      const rows: Record<string, string>[] = [];
      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        const vals: string[] = [];
        let cur = '';
        let inQ = false;
        for (const ch of lines[i]) {
          if (ch === '"') { inQ = !inQ; continue; }
          if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; continue; }
          cur += ch;
        }
        vals.push(cur.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
        rows.push(row);
      }
      setPreviewCols(headers);
      setPreviewRows(rows);

      if (entity) {
        const map: Record<string, string> = {};
        for (const col of entity.columns) {
          const csvCol = headers.find((h) => h.toLowerCase() === col.toLowerCase());
          if (csvCol) map[col] = csvCol;
        }
        setColMap(map);
      }
    };
    reader.readAsText(file);
  };

  const doImport = async () => {
    if (!selEntity || previewRows.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/dataio/import/${selEntity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: previewRows, columnMapping: colMap }),
      });
      const data = await res.json();
      setResult(data);
      if (data.imported > 0) { setPreviewRows([]); fileRef.current && (fileRef.current.value = ''); }
    } catch (err: any) {
      setResult({ imported: 0, skipped: 0, errors: [err.message] });
    }
    setImporting(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Database className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Data Import / Export</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('export')} className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'export' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <FileDown size={16} /> Export
        </button>
        <button onClick={() => setTab('import')} className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'import' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <FileUp size={16} /> Import
        </button>
      </div>

      {/* Entity Selector */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Entity</label>
        <select value={selEntity} onChange={(e) => { setSelEntity(e.target.value); setPreviewRows([]); setResult(null); }}
          className="w-full max-w-md border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
          {entities.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>

      {/* Export */}
      {tab === 'export' && entity && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Export Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {entity.dateField && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </>
            )}
            {entity.statusField && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <input type="text" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="e.g. Active, Booked, Paid..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            )}
            <div className="flex items-end gap-2">
              <button onClick={doExport} className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
                <Download size={16} /> Export CSV
              </button>
              <button onClick={doDownloadSample} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <ArrowDownToLine size={16} /> Sample
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">Columns: {entity.columns.join(', ')}</p>
        </div>
      )}

      {/* Import */}
      {tab === 'import' && entity && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Import Data</h2>

          <div className="flex items-end gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                1. Download sample CSV to match headers
              </label>
              <button onClick={doDownloadSample} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <ArrowDownToLine size={16} /> Download {entity.id} Sample
              </button>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                2. Upload your CSV file
              </label>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
          </div>

          {previewRows.length > 0 && (
            <>
              {/* Column Mapping */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2">Column Mapping (DB column → CSV header)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {entity.columns.filter((c) => c !== 'id' && c !== 'created_at').map((col) => (
                    <div key={col} className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-600 font-medium truncate">{col}:</span>
                      <select value={colMap[col] || ''} onChange={(e) => setColMap({ ...colMap, [col]: e.target.value })}
                        className="border rounded px-1 py-0.5 text-[11px] outline-none flex-1">
                        <option value="">-- skip --</option>
                        {previewCols.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview (first 10 rows) */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-2">Preview (first {previewRows.length} rows)</label>
                <div className="border rounded-lg overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr>
                        {previewCols.map((h) => <th key={h} className="text-left py-1.5 px-2 whitespace-nowrap">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {previewCols.map((h) => <td key={h} className="py-1 px-2 whitespace-nowrap">{row[h]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button onClick={doImport} disabled={importing}
                className="flex items-center gap-1.5 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50">
                <Upload size={16} /> {importing ? 'Importing...' : `Import ${previewRows.length} Rows`}
              </button>
            </>
          )}

          {result && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${result.errors.length > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              <div className="flex items-center gap-1.5 font-medium mb-1">
                {result.errors.length > 0 ? <AlertCircle size={16} /> : <Check size={16} />}
                {result.imported} imported, {result.skipped} skipped
              </div>
              {result.errors.length > 0 && (
                <ul className="list-disc pl-4 text-xs mt-1">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
