import { useEffect, useState } from 'react';
import { api } from '../api';
import { BarChart3 } from 'lucide-react';

interface ReportData {
  label: string;
  value: number | string;
  sub?: string;
}

export default function Reports() {
  const [reports, setReports] = useState<ReportData[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.get(),
      api.vehicles.list(),
      api.drivers.list(),
      api.bookings.list(),
      api.invoices.list(),
      api.payments.list(),
      api.fuel.summary(),
      api.expenses.categories(),
    ]).then(([dashboard, vehicles, drivers, bookings, invoices, payments, fuelSummary, expenseCats]) => {
      const sections: ReportData[][] = [
        [
          { label: 'Total Bookings', value: dashboard.bookings.total_bookings, sub: `Completed: ${dashboard.bookings.completed}` },
          { label: 'Active Vehicles', value: `${dashboard.vehicles.active}/${dashboard.vehicles.total}` },
          { label: 'Active Drivers', value: `${dashboard.drivers.active}/${dashboard.drivers.total}` },
          { label: 'Total Invoiced', value: dashboard.invoices.total_amount.toLocaleString() },
          { label: 'Collected', value: dashboard.invoices.paid_amount.toLocaleString() },
          { label: 'Outstanding', value: dashboard.invoices.outstanding.toLocaleString() },
        ],
        [
          { label: 'Total Bookings Value', value: bookings.reduce((s: number, b: any) => s + (b.total_amount || 0), 0).toLocaleString() },
          { label: 'Avg Booking Value', value: bookings.length > 0 ? (bookings.reduce((s: number, b: any) => s + (b.total_amount || 0), 0) / bookings.length).toFixed(0) : '0' },
          { label: 'Completed Trips', value: bookings.filter((b: any) => b.status === 'Completed').length },
          { label: 'In Progress', value: bookings.filter((b: any) => b.status === 'In Progress').length },
        ],
        [
          { label: 'Total Invoices', value: invoices.length },
          { label: 'Paid Invoices', value: invoices.filter((i: any) => i.status === 'Paid').length },
          { label: 'Unpaid Invoices', value: invoices.filter((i: any) => i.status === 'Unpaid').length },
          { label: 'Partial Payments', value: invoices.filter((i: any) => i.status === 'Partial').length },
        ],
        [
          { label: 'Fuel - Total Liters', value: fuelSummary.reduce((s: number, f: any) => s + f.total_liters, 0).toFixed(1) },
          { label: 'Fuel - Total Cost', value: fuelSummary.reduce((s: number, f: any) => s + f.total_cost, 0).toLocaleString() },
          { label: 'Fuel - Avg Cost/Ltr', value: (() => {
            const totalL = fuelSummary.reduce((s: number, f: any) => s + f.total_liters, 0);
            const totalC = fuelSummary.reduce((s: number, f: any) => s + f.total_cost, 0);
            return totalL > 0 ? (totalC / totalL).toFixed(2) : '0';
          })()},
        ],
        [
          ...expenseCats.map((c: any) => ({
            label: `Expense: ${c.expense_category}`,
            value: c.total.toLocaleString(),
            sub: `${c.count} entries`,
          })),
        ],
      ];
      setReports(sections);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400 dark:text-gray-500">Loading reports...</div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reports & Analytics</h1>
      </div>

      <div className="space-y-6">
        {reports.map((section, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 p-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {['Business Overview', 'Booking Analytics', 'Invoice Summary', 'Fuel Summary', 'Expense Breakdown'][idx] || 'Report'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {section.map((item) => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.value}</p>
                  {item.sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
