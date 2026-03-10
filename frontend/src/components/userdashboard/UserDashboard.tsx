// pages/dashboard/Dashboard.tsx
// This is ONLY the overview page content.
// The sidebar, header, and layout are handled by DashboardShell.
// Auth guard should live in a ProtectedRoute wrapper, not here.

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatRelativeTime, parseTransaction } from '../../types/utils';
import SendMoneyModal from './Sendmoneymodal';
import AddContactModal from './Addcontactmodal';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_DATA = [
  { month: 'Jan', income: 3200, expense: 2100 },
  { month: 'Feb', income: 3800, expense: 2400 },
  { month: 'Mar', income: 4200, expense: 2800 },
  { month: 'Apr', income: 3600, expense: 2200 },
  { month: 'May', income: 4500, expense: 3100 },
  { month: 'Jun', income: 4800, expense: 2900 },
];

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardOverview = () => {
  const { user } = useAuth();
  const {
    wallet,
    balance,
    transactions,
    transactionCount,
    isLoading: walletLoading,
    error: walletError,
    fetchWallet,
    fetchTransactions,
    clearError,
    submitTransfer,
    contacts,
  } = useWallet();

  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [addContactModalOpen, setAddContactModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | undefined>();

  const navigate = useNavigate();

  // ── Derived data ────────────────────────────────────────────────────────────

  const parsedTransactions = useMemo(() => {
    try { return transactions.map(parseTransaction); }
    catch { return []; }
  }, [transactions]);

  const totalCredits = useMemo(
    () => parsedTransactions.filter(t => t.isCredit && t.isCompleted).reduce((s, t) => s + t.amountNumber, 0),
    [parsedTransactions]
  );

  const totalDebits = useMemo(
    () => parsedTransactions.filter(t => t.isDebit && t.isCompleted).reduce((s, t) => s + t.amountNumber, 0),
    [parsedTransactions]
  );

  const maxChartValue = Math.max(...CHART_DATA.flatMap(d => [d.income, d.expense]));
  const creditCount = parsedTransactions.filter(t => t.isCredit).length;
  const debitCount  = parsedTransactions.filter(t => t.isDebit).length;

  const formattedBalance = walletLoading && !wallet ? '...' : formatCurrency(balance, 'NGN');

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchWallet();
    fetchTransactions(5);
  }, [fetchWallet, fetchTransactions]);

  // Handle return from payment gateway (Paystack / Flutterwave redirect back)
  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const reference = params.get('payment_reference') ?? params.get('reference');
    const status    = params.get('status');

    if (!reference || status !== 'completed') return;

    verifyPaymentAndRefresh(reference);

    async function verifyPaymentAndRefresh(ref: string) {
      const token = sessionStorage.getItem('access_token');
      window.history.replaceState({}, '', '/dashboard');
      if (!token) return;

      const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
      try {
        const res  = await fetch(`${API_BASE}/wallet/verify/${ref}/`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (res.ok && data.status === 'COMPLETED') {
          await fetchWallet();
          await fetchTransactions(5);
          alert(`Payment successful! New balance: ${formatCurrency(data.new_balance, 'NGN')}`);
        } else {
          alert('Payment verification failed. Please contact support if an amount was debited.');
        }
      } catch {
        alert('Error verifying payment. Please refresh the page or contact support.');
      }
    }
  }, [fetchWallet, fetchTransactions]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleContactClick = (username: string) => {
    setSelectedRecipient(username);
    setSendModalOpen(true);
  };

  const handleSendClick = () => {
    setSelectedRecipient(undefined);
    setSendModalOpen(true);
  };

  const handleTransferSuccess = () => {
    fetchWallet();
    fetchTransactions(5);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Wallet error banner */}
      {walletError && (
        <div className="mb-6 flex items-center justify-between px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{walletError}</span>
          </div>
          <button onClick={clearError} className="text-red-400 hover:text-red-300 font-medium ml-4">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">

        {/* ── Left section ──────────────────────────────────────────────────── */}
        <div className="col-span-8 space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <p className="text-orange-100 text-sm font-medium mb-1">Total Income</p>
                {walletLoading && !wallet ? (
                  <div className="h-9 w-28 bg-white/20 rounded-lg animate-pulse mb-1" />
                ) : (
                  <p className="text-white text-3xl font-bold mb-1">{formatCurrency(totalCredits, 'NGN')}</p>
                )}
                <div className="flex items-center gap-1 text-orange-100 text-xs">
                  <span>↗</span>
                  <span>From completed credits</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <p className="text-emerald-100 text-sm font-medium mb-1">Total Expenses</p>
                {walletLoading && !wallet ? (
                  <div className="h-9 w-28 bg-white/20 rounded-lg animate-pulse mb-1" />
                ) : (
                  <p className="text-white text-3xl font-bold mb-1">{formatCurrency(totalDebits, 'NGN')}</p>
                )}
                <div className="flex items-center gap-1 text-emerald-100 text-xs">
                  <span>↘</span>
                  <span>From completed debits</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <p className="text-purple-100 text-sm font-medium mb-1">Active Cards</p>
                <p className="text-white text-3xl font-bold mb-1">3</p>
                <div className="flex items-center gap-1 text-purple-100 text-xs">
                  <span>💳</span>
                  <span>Visa, Mastercard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-2">Total Wallet Balance</p>
                  {walletLoading && !wallet ? (
                    <div className="h-14 w-52 bg-white/20 rounded-xl animate-pulse" />
                  ) : (
                    <p className="text-white text-5xl font-bold tracking-tight">{formattedBalance}</p>
                  )}
                  {wallet && (
                    <p className="text-blue-200 text-xs mt-2">
                      Last updated {formatRelativeTime(wallet.updated_at)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <span className="text-white text-lg">💱</span>
                  </button>
                  <button
                    onClick={fetchWallet}
                    title="Refresh balance"
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <span className={`text-white text-lg inline-block ${walletLoading ? 'animate-spin' : ''}`}>
                      🔄
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Navigate to the wallets page instead of switching an internal tab */}
                <button
                  onClick={() => navigate('/dashboard/wallets')}
                  className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  Fund Wallet
                </button>
                <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors">
                  Receive
                </button>
              </div>
            </div>
          </div>

          {/* Quick Transfer */}
          <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Quick Transfer</h3>
              <button
                onClick={() => setAddContactModalOpen(true)}
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                Manage Contacts
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {contacts.slice(0, 4).map((contact) => (
                <button
                  key={contact.username}
                  onClick={() => handleContactClick(contact.username)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-semibold ring-2 ring-transparent group-hover:ring-emerald-500 transition-all`}>
                    {contact.initials}
                  </div>
                  <span className="text-xs text-gray-400">{contact.display_name.split(' ')[0]}</span>
                </button>
              ))}
              <button
                onClick={() => setAddContactModalOpen(true)}
                className="w-14 h-14 rounded-full bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center text-2xl text-gray-400 transition-colors"
              >
                +
              </button>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter username or amount"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                onFocus={handleSendClick}
                readOnly
              />
              <button
                onClick={handleSendClick}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* ── Right section ─────────────────────────────────────────────────── */}
        <div className="col-span-4 space-y-6">

          {/* Donut chart */}
          <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Card Overview</h3>
              <select className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Yearly</option>
              </select>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#1f2937" strokeWidth="12" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="77 220" strokeDashoffset="0" className="transition-all duration-1000" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="88 220" strokeDashoffset="-77" className="transition-all duration-1000" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="55 220" strokeDashoffset="-165" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-white">76%</p>
                  <p className="text-xs text-gray-500">Total Usage</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full mt-6">
                {[
                  { color: 'bg-orange-500', label: 'Shopping', value: '35%' },
                  { color: 'bg-blue-500',   label: 'Bills',    value: '40%' },
                  { color: 'bg-emerald-500',label: 'Food',     value: '25%' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity chart */}
          <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Activity</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-gray-400">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-xs text-gray-400">Expense</span>
                  </div>
                </div>
              </div>
              <select className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
                <option>Last 6 months</option>
                <option>Last 3 months</option>
                <option>This year</option>
              </select>
            </div>

            <div className="flex items-end justify-between gap-2 h-32">
              {CHART_DATA.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1 h-24">
                    <div
                      className="w-2 bg-emerald-500 rounded-t transition-all duration-500 hover:bg-emerald-400"
                      style={{ height: `${(data.income / maxChartValue) * 100}%` }}
                    />
                    <div
                      className="w-2 bg-orange-500 rounded-t transition-all duration-500 hover:bg-orange-400"
                      style={{ height: `${(data.expense / maxChartValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800/50">
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg per Credit</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(creditCount > 0 ? totalCredits / creditCount : 0, 'NGN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Avg per Debit</p>
                <p className="text-lg font-bold text-orange-400">
                  {formatCurrency(debitCount > 0 ? totalDebits / debitCount : 0, 'NGN')}
                </p>
              </div>
            </div>
          </div>

          {/* Pending tasks */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <p className="text-cyan-100 text-sm font-medium mb-1">Pending Tasks</p>
              <p className="text-white text-3xl font-bold mb-1">852</p>
              <div className="flex items-center gap-1 text-cyan-100 text-xs">
                <span>📋</span>
                <span>Complete today</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Transaction overview — full width ─────────────────────────────── */}
        <div className="col-span-12 bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Transaction Overview</h3>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                Download CSV
              </button>
              <select className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
                <option>All Time</option>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>

          {walletLoading && transactions.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-800 rounded w-32" />
                    <div className="h-2 bg-gray-800 rounded w-20" />
                  </div>
                  <div className="h-3 bg-gray-800 rounded w-20" />
                </div>
              ))}
            </div>
          ) : parsedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <span className="text-5xl mb-3">📭</span>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  {['Transaction', 'Type', 'Date', 'Amount', 'Status'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        i === 3 ? 'text-right' : i === 4 ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          txn.isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {txn.isCredit ? '↓' : '↑'}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {txn.description ?? txn.source.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{txn.reference.slice(0, 16)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-400">{txn.source.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-400">{formatRelativeTime(txn.created_at)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-semibold ${txn.isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {txn.isCredit ? '+' : '-'}{formatCurrency(txn.amountNumber, 'NGN')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        txn.isCompleted ? 'bg-emerald-500/10 text-emerald-400'
                        : txn.isPending  ? 'bg-orange-500/10 text-orange-400'
                        : txn.isFailed   ? 'bg-red-500/10 text-red-400'
                        : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        {txn.status.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-6 pt-6 border-t border-gray-800/50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {parsedTransactions.length} of {transactionCount} transactions
            </p>
            <button
              onClick={() => navigate('/dashboard/transactions')}
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View All Transactions →
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <SendMoneyModal
        isOpen={sendModalOpen}
        onClose={() => { setSendModalOpen(false); setSelectedRecipient(undefined); }}
        currentBalance={balance}
        submitTransfer={submitTransfer}
        onTransferSuccess={handleTransferSuccess}
        prefilledRecipient={selectedRecipient}
      />

      <AddContactModal
        isOpen={addContactModalOpen}
        onClose={() => setAddContactModalOpen(false)}
      />
    </>
  );
};

export default DashboardOverview;