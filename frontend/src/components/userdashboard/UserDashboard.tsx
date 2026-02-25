import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatRelativeTime, parseTransaction } from '../../types/utils';

// Error Boundary Component

const Dashboard = () => {
  console.log('🚀 Dashboard component rendering...');
  console.log('📍 URL:', window.location.href);
  console.log('🔍 Search params:', window.location.search);

  const urlParams = new URLSearchParams(window.location.search);
  const hasPaymentReturn = urlParams.has('payment_reference') || urlParams.has('reference');
  console.log('💳 Payment return detected:', hasPaymentReturn);

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  console.log('👤 Auth state:', { isAuthenticated, authLoading, hasUser: !!user, username: user?.username });

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
    fundingForm,
    setFundingAmount,
    setFundingGateway,
    submitFunding,
  } = useWallet();
  console.log('💰 Wallet state:', {
    hasWallet: !!wallet,
    balance,
    transactionsCount: transactions?.length || 0,
    walletLoading,
    hasError: !!walletError
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [pageError, setPageError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('✅ All hooks initialized successfully');

  // ✅ MOVE useMemo HERE - BEFORE the early returns
  const parsedTransactions = React.useMemo(() => {
    try {
      console.log('🔄 Parsing transactions:', transactions.length);
      return transactions.map(parseTransaction);
    } catch (error) {
      console.error('💥 Error parsing transactions:', error);
      return [];
    }
  }, [transactions]);

  // ✅ MOVE all other derived state HERE
  const totalCredits = parsedTransactions
    .filter(t => t.isCredit && t.isCompleted)
    .reduce((sum, t) => sum + t.amountNumber, 0);

  const totalDebits = parsedTransactions
    .filter(t => t.isDebit && t.isCompleted)
    .reduce((sum, t) => sum + t.amountNumber, 0);

  const activeCards = 3;
  const pendingTasks = 852;
  const chartData = [
    { month: 'Jan', income: 3200, expense: 2100 },
    { month: 'Feb', income: 3800, expense: 2400 },
    { month: 'Mar', income: 4200, expense: 2800 },
    { month: 'Apr', income: 3600, expense: 2200 },
    { month: 'May', income: 4500, expense: 3100 },
    { month: 'Jun', income: 4800, expense: 2900 },
  ];
  const maxValue = Math.max(...chartData.flatMap(d => [d.income, d.expense]));

  // ✅ MOVE useEffects HERE - BEFORE the early returns
  useEffect(() => {
    console.log('📥 Fetch wallet effect running...', { isAuthenticated });
    if (isAuthenticated) {
      console.log('📥 Fetching wallet and transactions...');
      fetchWallet();
      fetchTransactions(5);
    }
  }, [isAuthenticated, fetchWallet, fetchTransactions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('payment_reference') || params.get('reference');
    const statusParam = params.get('status');

    console.log('🔍 Verification effect:', { reference, statusParam, isAuthenticated });

    if (reference && statusParam === 'completed' && isAuthenticated) {
      console.log('✅ Initiating payment verification for:', reference);
      verifyPaymentAndRefresh(reference);
    }

    async function verifyPaymentAndRefresh(reference: string) {
      try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
          console.error('❌ No access token found');
          window.history.replaceState({}, '', '/dashboard');
          return;
        }

        console.log('🔍 Verifying payment:', reference);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/wallet/verify/${reference}/`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        console.log('📦 Verification response:', data);

        if (response.ok && data.status === 'COMPLETED') {
          console.log('✅ Payment verified successfully');
          window.history.replaceState({}, '', '/dashboard');
          await fetchWallet();
          await fetchTransactions(5);
          alert(`Payment successful! New balance: ${formatCurrency(data.new_balance, 'NGN')}`);
        } else {
          console.error('❌ Payment verification failed:', data);
          window.history.replaceState({}, '', '/dashboard');
          alert('Payment verification failed. Please contact support if amount was debited.');
        }
      } catch (error) {
        console.error('💥 Error verifying payment:', error);
        window.history.replaceState({}, '', '/dashboard');
        alert('Error verifying payment. Please refresh the page or contact support.');
      }
    }
  }, [isAuthenticated, fetchWallet, fetchTransactions]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ NOW the early returns can happen AFTER all hooks
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/signin');
    return null;
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md">
          <h2 className="text-red-400 font-bold text-xl mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{pageError}</p>
          <button
            onClick={() => {
              setPageError(null);
              window.history.replaceState({}, '', '/dashboard');
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';
  const formattedBalance = walletLoading && !wallet ? '...' : formatCurrency(balance, 'NGN');


  return (
    <div className="min-h-screen bg-[#0a0f1e] text-gray-100" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f1629] border-r border-gray-800/50 flex flex-col z-20">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">dompet</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-blue-500/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { icon: '📊', label: 'Dashboard', id: 'overview' },
            { icon: '💳', label: 'My Cards', id: 'cards', count: 3 },
            { icon: '📝', label: 'Invoices', id: 'invoices' },
            { icon: '💱', label: 'Transactions', id: 'transactions' },
            { icon: '💰', label: 'Wallets', id: 'wallets' },
            { icon: '📈', label: 'Analytics', id: 'analytics' },
            { icon: '⚙️', label: 'Settings', id: 'settings' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              {item.count && (
                <span className="px-2 py-0.5 bg-gray-800 rounded-md text-xs text-gray-400">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-800/50 bg-[#0f1629]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="h-full px-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">
                {activeTab === 'overview' ? 'Dashboard' : activeTab}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.username}!</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              </div>
              <button className="relative p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="relative p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <span className="text-xl">💬</span>
              </button>
              <button className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <span className="text-xl">⚙️</span>
              </button>
              <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <span>⬇️</span>
                Download Report
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">

          {/* ── Wallet Error Banner ─────────────────────────────────────────── */}
          {walletError && (
            <div className="mb-6 flex items-center justify-between px-5 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{walletError}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 font-medium ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ── Overview Tab ────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-12 gap-6">

              {/* Left Section */}
              <div className="col-span-8 space-y-6">

                {/* Top Stats Row */}
                <div className="grid grid-cols-3 gap-4">

                  {/* Total Credits */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <p className="text-orange-100 text-sm font-medium mb-1">Total Income</p>
                      {walletLoading && !wallet ? (
                        <div className="h-9 w-28 bg-white/20 rounded-lg animate-pulse mb-1" />
                      ) : (
                        <p className="text-white text-3xl font-bold mb-1">
                          {formatCurrency(totalCredits, 'NGN')}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-orange-100 text-xs">
                        <span>↗</span>
                        <span>From completed credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Debits */}
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <p className="text-emerald-100 text-sm font-medium mb-1">Total Expenses</p>
                      {walletLoading && !wallet ? (
                        <div className="h-9 w-28 bg-white/20 rounded-lg animate-pulse mb-1" />
                      ) : (
                        <p className="text-white text-3xl font-bold mb-1">
                          {formatCurrency(totalDebits, 'NGN')}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-emerald-100 text-xs">
                        <span>↘</span>
                        <span>From completed debits</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Cards (static for now) */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <p className="text-purple-100 text-sm font-medium mb-1">Active Cards</p>
                      <p className="text-white text-3xl font-bold mb-1">{activeCards}</p>
                      <div className="flex items-center gap-1 text-purple-100 text-xs">
                        <span>💳</span>
                        <span>Visa, Mastercard</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className="text-blue-100 text-sm font-medium mb-2">Total Wallet Balance</p>
                        {walletLoading && !wallet ? (
                          <div className="h-14 w-52 bg-white/20 rounded-xl animate-pulse" />
                        ) : (
                          <p className="text-white text-5xl font-bold tracking-tight">
                            {formattedBalance}
                          </p>
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
                      <button
                        onClick={() => setActiveTab('wallets')}
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
                    <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {[
                      { name: 'Sarah', initials: 'SM', color: 'from-pink-500 to-rose-500' },
                      { name: 'John', initials: 'JD', color: 'from-blue-500 to-cyan-500' },
                      { name: 'Emma', initials: 'EW', color: 'from-purple-500 to-pink-500' },
                      { name: 'Mike', initials: 'MJ', color: 'from-orange-500 to-red-500' },
                    ].map((contact) => (
                      <div key={contact.name} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-semibold ring-2 ring-transparent group-hover:ring-emerald-500 transition-all`}>
                          {contact.initials}
                        </div>
                        <span className="text-xs text-gray-400">{contact.name}</span>
                      </div>
                    ))}
                    <button className="w-14 h-14 rounded-full bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center text-2xl text-gray-400 transition-colors">
                      +
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter amount"
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className="col-span-4 space-y-6">

                {/* Card Overview Donut */}
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
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#f97316" strokeWidth="12"
                          strokeDasharray="77 220" strokeDashoffset="0" className="transition-all duration-1000" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="12"
                          strokeDasharray="88 220" strokeDashoffset="-77" className="transition-all duration-1000" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="12"
                          strokeDasharray="55 220" strokeDashoffset="-165" className="transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-white">76%</p>
                        <p className="text-xs text-gray-500">Total Usage</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 w-full mt-6">
                      {[
                        { color: 'bg-orange-500', label: 'Shopping', value: '35%' },
                        { color: 'bg-blue-500', label: 'Bills', value: '40%' },
                        { color: 'bg-emerald-500', label: 'Food', value: '25%' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <div>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-sm font-semibold text-white">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity Chart */}
                <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Activity</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-xs text-gray-400">Income</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
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
                    {chartData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center gap-1 h-24">
                          <div className="w-2 bg-emerald-500 rounded-t transition-all duration-500 hover:bg-emerald-400"
                            style={{ height: `${(data.income / maxValue) * 100}%` }}></div>
                          <div className="w-2 bg-orange-500 rounded-t transition-all duration-500 hover:bg-orange-400"
                            style={{ height: `${(data.expense / maxValue) * 100}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{data.month}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800/50">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Average per Txn</p>
                      <p className="text-lg font-bold text-emerald-400">
                        {formatCurrency(
                          parsedTransactions.filter(t => t.isCredit).length > 0
                            ? totalCredits / parsedTransactions.filter(t => t.isCredit).length
                            : 0,
                          'NGN'
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Average per Txn</p>
                      <p className="text-lg font-bold text-orange-400">
                        {formatCurrency(
                          parsedTransactions.filter(t => t.isDebit).length > 0
                            ? totalDebits / parsedTransactions.filter(t => t.isDebit).length
                            : 0,
                          'NGN'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending Tasks */}
                <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <p className="text-cyan-100 text-sm font-medium mb-1">Pending Tasks</p>
                    <p className="text-white text-3xl font-bold mb-1">{pendingTasks}</p>
                    <div className="flex items-center gap-1 text-cyan-100 text-xs">
                      <span>📋</span>
                      <span>Complete today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Overview - Full Width */}
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

                {/* Loading skeleton */}
                {walletLoading && transactions.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-gray-800"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-800 rounded w-32"></div>
                          <div className="h-2 bg-gray-800 rounded w-20"></div>
                        </div>
                        <div className="h-3 bg-gray-800 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : parsedTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <span className="text-5xl mb-3">📭</span>
                    <p className="text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800/50">
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedTransactions.map((txn) => (
                          <tr key={txn.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                                  txn.isCredit
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {txn.isCredit ? '↓' : '↑'}
                                </div>
                                <div>
                                  <p className="font-medium text-white text-sm">
                                    {txn.description ?? txn.source.replace('_', ' ')}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono">
                                    {txn.reference.slice(0, 16)}…
                                  </p>
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
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-800/50 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {parsedTransactions.length} of {transactionCount} transactions
                  </p>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    View All Transactions →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Wallets Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'wallets' && (
            <div className="space-y-6">
              {/* Balance summary */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-2">Available Balance</p>
                  {walletLoading && !wallet ? (
                    <div className="h-16 w-52 bg-white/20 rounded-xl animate-pulse" />
                  ) : (
                    <p className="text-white text-6xl font-bold tracking-tight">{formattedBalance}</p>
                  )}
                  {wallet && (
                    <p className="text-blue-200 text-sm mt-3">
                      Last updated {formatDate(wallet.updated_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Fund wallet form */}
              <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Fund Wallet</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      min={100}
                      value={fundingForm.amount}
                      onChange={e => setFundingAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Payment Method</label>
                    <select
                      value={fundingForm.gateway}
                      onChange={e => setFundingGateway(e.target.value as 'paystack' | 'flutterwave')}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="paystack">Paystack</option>
                      <option value="flutterwave">Flutterwave</option>
                    </select>
                  </div>
                  <button
                    onClick={submitFunding}
                    disabled={fundingForm.isLoading || !fundingForm.amount || Number(fundingForm.amount) < 100}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
                  >
                    {fundingForm.isLoading ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Transactions Tab ────────────────────────────────────────────── */}
          {activeTab === 'transactions' && (
            <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">All Transactions</h3>
                <button
                  onClick={() => fetchTransactions()}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className={walletLoading ? 'animate-spin inline-block' : ''}>🔄</span>
                  Refresh
                </button>
              </div>

              {walletLoading && transactions.length === 0 ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-gray-800"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-800 rounded w-40"></div>
                        <div className="h-2 bg-gray-800 rounded w-24"></div>
                      </div>
                      <div className="h-3 bg-gray-800 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : parsedTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                  <span className="text-6xl mb-4">📭</span>
                  <p className="text-lg font-medium text-white mb-1">No transactions yet</p>
                  <p className="text-sm">Fund your wallet to get started</p>
                  <button
                    onClick={() => setActiveTab('wallets')}
                    className="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Fund Wallet
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-4">
                          <span className="text-xs text-gray-500 font-mono">{txn.reference.slice(0, 16)}…</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-white">{txn.description ?? '—'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-400">{txn.source.replace('_', ' ')}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-400">{formatDate(txn.created_at)}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-semibold ${txn.isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {txn.isCredit ? '+' : '-'}{formatCurrency(txn.amountNumber, 'NGN')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm text-gray-300">
                            {formatCurrency(txn.balanceAfterNumber, 'NGN')}
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

              {transactionCount > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800/50">
                  <p className="text-sm text-gray-500">{transactionCount} total transactions</p>
                </div>
              )}
            </div>
          )}

          {/* ── Remaining tabs (coming soon) ─────────────────────────────────── */}
          {['cards', 'invoices', 'analytics', 'settings'].includes(activeTab) && (
            <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-8 text-center">
              <span className="text-6xl mb-4 block">
                {({ cards: '💳', invoices: '📝', analytics: '📈', settings: '⚙️' } as Record<string, string>)[activeTab]}
              </span>
              <h3 className="text-2xl font-bold text-white mb-2 capitalize">{activeTab}</h3>
              <p className="text-gray-400">This feature is coming soon!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Export with Error Boundary
export default Dashboard;