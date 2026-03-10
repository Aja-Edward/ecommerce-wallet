// pages/dashboard/TransactionsPage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { formatCurrency, formatDate, parseTransaction } from '../../types/utils';

type FilterStatus = 'all' | 'completed' | 'pending' | 'failed';
type FilterType   = 'all' | 'credit' | 'debit';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const {
    transactions,
    transactionCount,
    isLoading: walletLoading,
    fetchTransactions,
  } = useWallet();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter,   setTypeFilter]   = useState<FilterType>('all');
  const [search,       setSearch]       = useState('');

  const parsedTransactions = useMemo(() => {
    try { return transactions.map(parseTransaction); }
    catch { return []; }
  }, [transactions]);

  const filtered = useMemo(() => {
    return parsedTransactions.filter(txn => {
      if (statusFilter === 'completed' && !txn.isCompleted) return false;
      if (statusFilter === 'pending'   && !txn.isPending)   return false;
      if (statusFilter === 'failed'    && !txn.isFailed)    return false;
      if (typeFilter   === 'credit'    && !txn.isCredit)    return false;
      if (typeFilter   === 'debit'     && !txn.isDebit)     return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          txn.reference.toLowerCase().includes(q) ||
          (txn.description ?? '').toLowerCase().includes(q) ||
          txn.source.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parsedTransactions, statusFilter, typeFilter, search]);

  const totalIn  = parsedTransactions.filter(t => t.isCredit && t.isCompleted).reduce((s, t) => s + t.amountNumber, 0);
  const totalOut = parsedTransactions.filter(t => t.isDebit  && t.isCompleted).reduce((s, t) => s + t.amountNumber, 0);

  return (
    <div className="space-y-6">

      {/* ── Summary strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: String(transactionCount),           color: 'text-white',        icon: '💱' },
          { label: 'Money In',           value: formatCurrency(totalIn,  'NGN'),    color: 'text-emerald-400',  icon: '↙' },
          { label: 'Money Out',          value: formatCurrency(totalOut, 'NGN'),    color: 'text-red-400',      icon: '↗' },
          { label: 'Net Flow',           value: formatCurrency(totalIn - totalOut, 'NGN'), color: totalIn >= totalOut ? 'text-emerald-400' : 'text-red-400', icon: '⚖️' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search by reference, description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5">
            {(['all', 'completed', 'pending', 'failed'] as FilterStatus[]).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5">
            {(['all', 'credit', 'debit'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  typeFilter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Refresh + Export */}
          <button
            onClick={() => fetchTransactions()}
            className="p-2.5 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <span className={walletLoading ? 'animate-spin inline-block' : ''}>🔄</span>
          </button>
          <button className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-2">
            <span>⬇️</span> Export CSV
          </button>
        </div>

        {/* Loading skeleton */}
        {walletLoading && transactions.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-40" />
                  <div className="h-2 bg-gray-800 rounded w-24" />
                </div>
                <div className="h-3 bg-gray-800 rounded w-24" />
              </div>
            ))}
          </div>

        /* Empty state */
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-lg font-medium text-white mb-1">
              {parsedTransactions.length === 0 ? 'No transactions yet' : 'No results match your filters'}
            </p>
            <p className="text-sm mb-4">
              {parsedTransactions.length === 0 ? 'Fund your wallet to get started' : 'Try adjusting your search or filters'}
            </p>
            {parsedTransactions.length === 0 && (
              <button
                onClick={() => navigate('/dashboard/wallets')}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Fund Wallet
              </button>
            )}
          </div>

        /* Table */
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/50">
                  {[
                    { label: 'Transaction',   align: 'left' },
                    { label: 'Source',        align: 'left' },
                    { label: 'Date',          align: 'left' },
                    { label: 'Amount',        align: 'right' },
                    { label: 'Balance After', align: 'right' },
                    { label: 'Status',        align: 'center' },
                  ].map(h => (
                    <th
                      key={h.label}
                      className={`py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-${h.align}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors group">

                    {/* Transaction */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                          txn.isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {txn.isCredit ? '↓' : '↑'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {txn.description ?? txn.source.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{txn.reference.slice(0, 18)}…</p>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-400 capitalize">{txn.source.replace(/_/g, ' ')}</span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-400">{formatDate(txn.created_at)}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-right">
                      <span className={`font-semibold ${txn.isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {txn.isCredit ? '+' : '-'}{formatCurrency(txn.amountNumber, 'NGN')}
                      </span>
                    </td>

                    {/* Balance After */}
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm text-gray-300">
                        {formatCurrency(txn.balanceAfterNumber, 'NGN')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
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
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-800/50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="text-white font-medium">{filtered.length}</span> of{' '}
              <span className="text-white font-medium">{transactionCount}</span> transactions
            </p>
            {filtered.length < transactionCount && (
              <button
                onClick={() => fetchTransactions(transactionCount)}
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Load all →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;