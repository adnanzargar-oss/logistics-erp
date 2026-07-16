import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import EditProfile from './components/EditProfile';
import { addNavigateListener } from './hooks/useNavigate';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider, useAuth } from './AuthContext';
import { Menu, ChevronDown, UserCircle, Database, Settings, LogOut } from 'lucide-react';
import Login from './components/Login';
import Users from './components/Users';
import Dashboard from './components/Dashboard';
import Bookings from './components/Bookings';
import Fleet from './components/Fleet';
import Customers from './components/Customers';
import FuelTracking from './components/FuelTracking';
import Maintenance from './components/Maintenance';
import Invoices from './components/Invoices';
import Payments from './components/Payments';
import Expenses from './components/Expenses';
import Warehouses from './components/Warehouses';
import Loadings from './components/Loadings';
import Receivings from './components/Receivings';
import Deliveries from './components/Deliveries';
import Reports from './components/Reports';
import BarcodePrint from './components/BarcodePrint';
import Calendar from './components/Calendar';
import DataIO from './components/DataIO';
import POD from './components/POD';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [detailKey, setDetailKey] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
  return addNavigateListener((p, _id) => { setPage(p); setDetailKey((k) => k + 1); });
  }, []);

  useEffect(() => {
  const handler = (e: Event) => {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (t.autocapitalize !== 'none' && ((t.tagName === 'INPUT' && (!t.type || t.type === 'text' || t.type === 'search' || t.type === 'tel')) || t.tagName === 'TEXTAREA')) {
    const orig = t.value;
    const tc = orig.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    if (tc !== orig && tc.length > 0) {
      const proto = t.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement : window.HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value')?.set;
      setter?.call(t, tc);
      t.dispatchEvent(new Event('input', { bubbles: true }));
    }
    }
  };
  document.addEventListener('blur', handler, true);
  return () => document.removeEventListener('blur', handler, true);
  }, []);

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
 <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
 </div>
 );
 }

  if (!user) return <Login />;

  const allowedModules = user.role === 'super_admin' ? null : (user.allowed_modules || {});

  const canAccess = (mod: string) => !allowedModules || mod in allowedModules;
  const modulePerms = (mod: string): string[] | null => {
    if (!allowedModules) return null;
    const p = allowedModules[mod];
    return p ? p.tabs : null;
  };
  const moduleActions = (mod: string): string[] | null => {
    if (!allowedModules) return null;
    const p = allowedModules[mod];
    return p ? p.actions : null;
  };

 const renderPage = () => {
 if (page === 'users') return allowedModules ? null : <Users />;
 if (page === 'dashboard') return <Dashboard key={`dash-${detailKey}`} />;
 if (!canAccess(page)) return <Dashboard key={`dash-${detailKey}`} />;
  switch (page) {
  case 'bookings': return <Bookings key={`book-${detailKey}`} tabs={modulePerms('bookings')} actions={moduleActions('bookings')} />;
  case 'loadings': return <Loadings key={`load-${detailKey}`} tabs={modulePerms('loadings')} actions={moduleActions('loadings')} />;
   case 'deliveries': return <Deliveries key={`del-${detailKey}`} tabs={modulePerms('deliveries')} actions={moduleActions('deliveries')} />;
  case 'pod': return <POD key={`pod-${detailKey}`} />;
  default: return (
  <>{{
  fleet: <Fleet />,
 customers: <Customers />,
 fuel: <FuelTracking />,
 maintenance: <Maintenance />,
 invoices: <Invoices />,
 payments: <Payments />,
 expenses: <Expenses />,
 barcodes: <BarcodePrint />,
 calendar: <Calendar />,
 warehouses: <Warehouses />,
  receivings: <Receivings key={`recv-${detailKey}`} tabs={modulePerms('receivings')} />,
  reports: <Reports />,
  dataio: <DataIO />,
  }[page]}</>
 );
 }
 };

  return (
  <div className="flex h-screen bg-gray-50 ">
  <Sidebar current={page} onNavigate={setPage} mobileOpen={mobileMenu} onMobileClose={() => setMobileMenu(false)} allowedModules={allowedModules} />
  <main className="flex-1 flex flex-col overflow-hidden">
  <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 bg-white shrink-0">
  <div className="flex items-center gap-2">
  <button onClick={() => setMobileMenu(true)} className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden">
  <Menu size={20} className="text-gray-600" />
  </button>
  </div>
  <div ref={profileRef} className="relative">
  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium">
  {user.username.charAt(0).toUpperCase()}
  </div>
  <span className="text-sm text-gray-700 hidden sm:block">{user.username}</span>
  <ChevronDown size={14} className="text-gray-400" />
  </button>
  {profileOpen && (
  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1 overflow-hidden">
  <div className="px-4 py-2.5 border-b border-gray-100">
  <p className="text-sm font-medium text-gray-900">{user.username}</p>
  <p className="text-xs text-gray-500 capitalize">{user.role.replace(/_/g, ' ')}</p>
  </div>
  {!allowedModules && (
  <button onClick={() => { setProfileOpen(false); setPage('users'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
  <UserCircle size={16} className="text-gray-400" /> Users
  </button>
  )}
  {canAccess('dataio') && (
  <button onClick={() => { setProfileOpen(false); setPage('dataio'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
  <Database size={16} className="text-gray-400" /> Data Import/Export
  </button>
  )}
  <button onClick={() => { setProfileOpen(false); setEditProfileOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
  <Settings size={16} className="text-gray-400" /> Edit Profile
  </button>
  <div className="border-t border-gray-100">
  <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
  <LogOut size={16} /> Sign Out
  </button>
  </div>
  </div>
  )}
  </div>
  </div>
  <div className="flex-1 overflow-auto">
  <div className="p-3 md:p-6 max-w-7xl mx-auto">
  {renderPage()}
  </div>
  </div>
  </main>
  {editProfileOpen && <EditProfile onClose={() => setEditProfileOpen(false)} />}
  </div>
  );
}

export default function App() {
 return (
 <ThemeProvider>
 <AuthProvider>
 <AppContent />
 </AuthProvider>
 </ThemeProvider>
 );
}
