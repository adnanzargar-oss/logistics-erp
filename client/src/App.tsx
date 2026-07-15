import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { addNavigateListener } from './hooks/useNavigate';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider, useAuth } from './AuthContext';
import { Menu, LogOut } from 'lucide-react';
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

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [detailKey, setDetailKey] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    return addNavigateListener((p, _id) => { setPage(p); setDetailKey((k) => k + 1); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Login />;

  const allowedModules = user.role === 'super_admin' ? null : new Set(user.allowed_modules || []);

  const canAccess = (mod: string) => !allowedModules || allowedModules.has(mod);

  const renderPage = () => {
    if (page === 'users') return allowedModules ? null : <Users />;
    if (page === 'dashboard') return <Dashboard key={`dash-${detailKey}`} />;
    if (!canAccess(page)) return <Dashboard key={`dash-${detailKey}`} />;
    switch (page) {
      case 'bookings': return <Bookings key={`book-${detailKey}`} />;
      case 'loadings': return <Loadings key={`load-${detailKey}`} />;
      case 'deliveries': return <Deliveries key={`del-${detailKey}`} />;
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
          receivings: <Receivings />,
          reports: <Reports />,
        }[page]}</>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar current={page} onNavigate={setPage} mobileOpen={mobileMenu} onMobileClose={() => setMobileMenu(false)} allowedModules={allowedModules} />
      <main className="flex-1 overflow-auto">
        <div className="md:hidden flex items-center justify-between gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenu(true)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Menu size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 468.62 308.07" className="w-5 h-3.5" xmlns="http://www.w3.org/2000/svg">
                <path fill="#ef453c" d="M204.18,163.65c21.38,24.62-15.53,62.07-32.17,29.03-14.83-.59-95.46-16.1-64.28-36.02,21.86,5.71,42.78,17.49,65.73,17.49,0-.19-.01-.39-.02-.58-10.93-3.18-81.37-12.81-61.44-28.05-31.28-12.46-79.7-55.6-22.06-70.16-31.1-1.69-110.39,8.25-73.7,53.75,15.36,18.78,38.28,31.83,59.47,43.55,15,4.77,10.99,24.08,18.13,35.66,8.79,22.99,24.43,45.98,44.43,60.52,2.98,4.08,8.62,8.62,13.24,9.9,60.77,44.39,153.5,29.63,200.41-28.35-22.43-3.02-44-7.63-65.81-13.18,80.28,9.01,280.12-7.83,112.46-94.04,67.56,68.06-90.76,54.84-125.67,47.1.05,9.9-50.1.38-61.18,2.07-4.85-6.15,7.38-25.8-7.54-28.69Z"/>
                <path fill="#2c2660" d="M316.71,195.75c56.09,3.79,132.62-1.53,81.87-52.57,167.77,86.27-32.39,103.03-112.46,94.04,21.81,5.54,43.38,10.16,65.81,13.18-46.91,57.98-139.65,72.74-200.41,28.35-4.62-1.27-10.26-5.81-13.24-9.9-20-14.53-35.64-37.53-44.43-60.51-7.13-11.58-3.13-30.9-18.12-35.66-21.19-11.73-44.12-24.77-59.48-43.55-36.66-45.51,42.57-55.41,73.7-53.75-57.67,14.58-9.19,57.7,22.06,70.16-19.92,15.22,50.4,24.85,61.44,28.05,0,.19.01.39.02.58-22.96,0-43.87-11.79-65.73-17.49-31.12,19.93,49.3,35.4,64.28,36.02,16.68,33.06,53.53-4.46,32.18-29.03,14.92,2.92,2.69,22.52,7.53,28.68,10.98-1.64,61.52,7.78,61.19-2.06,8.68,1.93,25.11,4.21,43.8,5.48"/>
              </svg>
              <span className="font-bold text-sm text-gray-800 dark:text-gray-100">PlanetERP</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[80px]">{user.username}</span>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="p-3 md:p-6 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
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
