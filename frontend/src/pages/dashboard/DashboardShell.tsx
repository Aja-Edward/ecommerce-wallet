// pages/dashboard/DashboardShell.tsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',    id: 'overview',      path: '/dashboard' },
  { icon: '💳', label: 'My Cards',     id: 'cards',         path: '/dashboard/cards',        count: 3 },
  { icon: '📝', label: 'Invoices',     id: 'invoices',      path: '/dashboard/invoices' },
  { icon: '💱', label: 'Transactions', id: 'transactions',  path: '/dashboard/transactions' },
  { icon: '💰', label: 'Wallets',      id: 'wallets',       path: '/dashboard/wallets' },
  { icon: '📈', label: 'Analytics',    id: 'analytics',     path: '/dashboard/analytics' },
  { icon: '⚙️', label: 'Settings',    id: 'settings',      path: '/dashboard/settings' },
] as const;

const DashboardShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '??';

  // Determine active tab from current path
  const activeId = NAV_ITEMS.slice()
    .reverse()
    .find(item => location.pathname.startsWith(item.path))?.id ?? 'overview';

  // Derive a readable page title
  const activeItem = NAV_ITEMS.find(item => item.id === activeId);
  const pageTitle = activeId === 'overview' ? 'Dashboard' : (activeItem?.label ?? 'Dashboard');

  return (
    <div
      className="min-h-screen bg-[#0a0f1e] text-gray-100"
      style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
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

        {/* User profile */}
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
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeId === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              {'count' in item && (
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

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="ml-64">
        {/* Header */}
        <header className="h-20 border-b border-gray-800/50 bg-[#0f1629]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="h-full px-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
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
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
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

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;