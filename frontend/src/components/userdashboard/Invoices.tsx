// pages/dashboard/InvoicesPage.tsx
import { useState } from 'react';

const INVOICES = [
  { id: 'INV-2024-001', client: 'Acme Corp', amount: 350_000, due: '2024-02-15', status: 'paid',    issued: '2024-01-15' },
  { id: 'INV-2024-002', client: 'TechNova Ltd', amount: 120_000, due: '2024-02-28', status: 'pending', issued: '2024-01-28' },
  { id: 'INV-2024-003', client: 'GlobalMart', amount: 95_000,  due: '2024-01-30', status: 'overdue', issued: '2024-01-01' },
  { id: 'INV-2024-004', client: 'Sunrise Agency', amount: 210_000, due: '2024-03-10', status: 'paid', issued: '2024-02-10' },
  { id: 'INV-2024-005', client: 'DevStudio NG', amount: 480_000, due: '2024-03-20', status: 'pending', issued: '2024-02-20' },
  { id: 'INV-2024-006', client: 'Fusion Media', amount: 75_000, due: '2024-01-25', status: 'overdue', issued: '2023-12-25' },
];

const STATUS_STYLES: Record<string, string> = {
  paid:    'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-orange-500/10 text-orange-400',
  overdue: 'bg-red-500/10 text-red-400',
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

const Invoices = () => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filtered = filter === 'all' ? INVOICES : INVOICES.filter(i => i.status === filter);
  const totalPaid = INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-[#0f1629] border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-2">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">{INVOICES.filter(i => i.status === 'paid').length} invoices</p>
        </div>
        <div className="bg-[#0f1629] border border-orange-500/20 rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-2">Pending</p>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-gray-500 mt-1">{INVOICES.filter(i => i.status === 'pending').length} invoices</p>
        </div>
        <div className="bg-[#0f1629] border border-red-500/20 rounded-2xl p-5">
          <p className="text-sm text-gray-400 mb-2">Overdue</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalOverdue)}</p>
          <p className="text-xs text-gray-500 mt-1">{INVOICES.filter(i => i.status === 'overdue').length} invoices</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">All Invoices</h3>
          <div className="flex items-center gap-3">
            {/* Filter pills */}
            <div className="flex gap-2">
              {(['all', 'paid', 'pending', 'overdue'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
              <span>+</span> New Invoice
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50">
              {['Invoice', 'Client', 'Issued', 'Due Date', 'Amount', 'Status', 'Action'].map((h, i) => (
                <th
                  key={h}
                  className={`py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    i >= 4 ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                <td className="py-4 px-4 text-sm font-mono text-white">{inv.id}</td>
                <td className="py-4 px-4 text-sm text-white">{inv.client}</td>
                <td className="py-4 px-4 text-sm text-gray-400">{inv.issued}</td>
                <td className="py-4 px-4 text-sm text-gray-400">{inv.due}</td>
                <td className="py-4 px-4 text-sm font-semibold text-white text-right">{formatCurrency(inv.amount)}</td>
                <td className="py-4 px-4 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">View →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <span className="text-5xl mb-3">📭</span>
            <p className="text-sm">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;