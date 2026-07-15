import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Search, X, CheckCircle2, Truck, Package, PackageCheck, ArrowDownToLine, ClipboardList, Circle, LogIn } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

const stageIcons: Record<string, any> = {
  clipboard: ClipboardList, package: Package, inbox: ArrowDownToLine,
  truck: Truck, check: PackageCheck,
};

const stageLabels: Record<string, string> = {
  clipboard: 'Booked', package: 'Loaded', inbox: 'Received at Hub',
  truck: 'Out for Delivery', check: 'Delivered',
};

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lrr, setLrr] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState('');
  const [trackBusy, setTrackBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const track = async () => {
    if (!lrr.trim()) return;
    setTrackBusy(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await fetch(`${BASE}/track/${encodeURIComponent(lrr.trim())}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'LRR not found' }));
        throw new Error(err.error);
      }
      setTrackResult(await res.json());
    } catch (err: any) {
      setTrackError(err.message);
    } finally {
      setTrackBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f2f3] dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <svg viewBox="0 0 468.62 308.07" className="w-16 h-auto mb-4 shrink-0 overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ef453c" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69ZM384.85,123.81C357.69-25.47,140.95-41.62,93.69,101.82c.61,3.17-5.24,4.51-1.38,7,9.21,5.65,19.63,15.34,29.75,17.09,27.37-16.04,59.22-7.19,87.79.38,2.78-6.71,5.54-13.37,8.4-20.27-32.96-4.77-80.02-8.3-18.3-28.69,29.36-7.78,60.45.39,89.34,7.12,12.32,15.97-24.52,95.41-1.41,90.6,25.89-106.78-8.36-110.72,96.98-51.24ZM140.3,159.38c5.43-20.2,10.72-21.22-12.53-25.83-6.58-2.1-5.93,9.46-8.64,13.48-4.76,10.27,14.8,8.25,21.17,12.36ZM235.79,132.05c6.24-.95,4.53-15.02,7.61-20.62-2.49-3.49-16.04-6.4-18.28-.63-6.74,21.67-12.66,16.33,10.68,21.25ZM195.9,174.31c-5.08,4.63-7.12,12.65-3.31,19.31,11.39,7.55,17.62-24.24,3.31-19.31ZM363.57,169.58c0-.19.01-.37.02-.56-74.01-8.8-74.42,6.46-.02.56ZM310.6,156.75c17.77,1.08,34.62,1.35,51.97,2.72-10.91-.92-48.76-14.53-51.97-2.72ZM362.57,149.68c.05-.2.1-.4.15-.6-63.25-20.67-66.13-6.53-.15.6ZM362.37,138.24c.1-.24.21-.47.31-.71-58.85-24-62.7-12.29-.31.71ZM320.79,111.9c10.24,3.66,22.28,9.45,32.54,10.67-5.36-2.2-32.29-20.07-32.54-10.67Z"/>
            <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
          </svg>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Planet Transport Pvt Ltd.</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tengpora Bypass, Srinagar</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Track Consignment */}
          <div className="p-5">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Track Consignment</h2>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-gray-400 dark:focus-within:ring-gray-500">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input value={lrr} onChange={(e) => setLrr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && track()}
                placeholder="Enter LRR number"
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400" />
              {lrr && <button onClick={() => { setLrr(''); setTrackResult(null); setTrackError(''); }} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"><X size={14} className="text-gray-400" /></button>}
              <button onClick={track} disabled={trackBusy || !lrr.trim()}
                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 shrink-0">
                {trackBusy ? '...' : 'Track'}
              </button>
            </div>

            {trackError && <p className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">{trackError}</p>}

            {trackResult && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">LRR</p>
                    <p className="text-sm font-bold dark:text-white">{trackResult.booking.booking_no}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    trackResult.booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    trackResult.booking.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{trackResult.booking.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div><span className="text-gray-400">From:</span> <span className="dark:text-gray-200">{trackResult.booking.from_location || trackResult.booking.pickup_location || '-'}</span></div>
                  <div><span className="text-gray-400">To:</span> <span className="dark:text-gray-200">{trackResult.booking.to_location || trackResult.booking.delivery_location || '-'}</span></div>
                </div>

                <div className="flex items-center pt-1">
                  {trackResult.stages.map((stage: any, i: number) => {
                    const Icon = stageIcons[stage.icon] || Circle;
                    const isLast = i === trackResult.stages.length - 1;
                    return (
                      <div key={i} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          stage.done ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}>
                          {stage.done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                        </div>
                        {!isLast && <div className={`h-0.5 flex-1 mx-0.5 ${stage.done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex mt-1">
                  {trackResult.stages.map((_: any, i: number) => (
                    <div key={i} className="flex-1 text-center">
                      <span className="text-[10px] text-gray-400">{stageLabels[_.icon] || _.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Employee Login */}
          <div className="p-5">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Employee Login</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}
              <input value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                placeholder="Username" required autoComplete="username" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                placeholder="Password" required autoComplete="current-password" />
              <button type="submit" disabled={busy}
                className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                <LogIn size={15} /> {busy ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4">Planet Transport Pvt Ltd &mdash; Logistics ERP</p>
      </div>
    </div>
  );
}
