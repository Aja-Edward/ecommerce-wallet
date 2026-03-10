// pages/dashboard/AnalyticsPage.tsx

const MONTHLY = [
  { month: 'Jan', income: 320000, expense: 210000 },
  { month: 'Feb', income: 380000, expense: 240000 },
  { month: 'Mar', income: 420000, expense: 280000 },
  { month: 'Apr', income: 360000, expense: 220000 },
  { month: 'May', income: 450000, expense: 310000 },
  { month: 'Jun', income: 480000, expense: 290000 },
];

const CATEGORIES = [
  { label: 'Food & Dining',    value: 28, color: 'bg-orange-500',  amount: 84_000 },
  { label: 'Bills & Utilities',value: 22, color: 'bg-blue-500',    amount: 66_000 },
  { label: 'Shopping',         value: 18, color: 'bg-purple-500',  amount: 54_000 },
  { label: 'Transport',        value: 15, color: 'bg-emerald-500', amount: 45_000 },
  { label: 'Entertainment',    value: 10, color: 'bg-pink-500',    amount: 30_000 },
  { label: 'Others',           value: 7,  color: 'bg-gray-500',    amount: 21_000 },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

const maxVal = Math.max(...MONTHLY.flatMap(d => [d.income, d.expense]));

const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Net Savings',   value: '₦190,000', change: '+12.4%', up: true,  color: 'text-emerald-400' },
          { label: 'Total Income',  value: '₦2,410,000', change: '+8.1%', up: true,  color: 'text-blue-400' },
          { label: 'Total Expense', value: '₦1,550,000', change: '-3.2%', up: false, color: 'text-orange-400' },
          { label: 'Savings Rate',  value: '35.7%',     change: '+2.1%', up: true,  color: 'text-purple-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-5">
            <p className="text-xs text-gray-500 mb-2">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color} mb-2`}>{kpi.value}</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${kpi.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {kpi.change} vs last period
            </span>
          </div>
        ))}
      </div>

      {/* Income vs Expense bar chart */}
      <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Income vs Expenses</h3>
            <div className="flex items-center gap-5 mt-2">
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
            <option>This year</option>
          </select>
        </div>

        <div className="flex items-end gap-4 h-48">
          {MONTHLY.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center gap-1.5 h-40">
                <div
                  className="flex-1 bg-emerald-500 rounded-t-lg hover:bg-emerald-400 transition-colors relative group"
                  style={{ height: `${(d.income / maxVal) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {formatCurrency(d.income)}
                  </div>
                </div>
                <div
                  className="flex-1 bg-orange-500 rounded-t-lg hover:bg-orange-400 transition-colors relative group"
                  style={{ height: `${(d.expense / maxVal) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {formatCurrency(d.expense)}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spending by category */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Spending by Category</h3>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-sm text-gray-300">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{formatCurrency(cat.amount)}</span>
                    <span className="text-sm font-semibold text-white">{cat.value}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings trend */}
        <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Monthly Savings</h3>
          <div className="space-y-3">
            {MONTHLY.map((d) => {
              const savings = d.income - d.expense;
              const pct = Math.round((savings / d.income) * 100);
              return (
                <div key={d.month} className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 w-8">{d.month}</span>
                  <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-xs text-white font-medium">{pct}%</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400 w-24 text-right">
                    {formatCurrency(savings)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-5 border-t border-gray-800/50 flex justify-between">
            <div>
              <p className="text-xs text-gray-500">Avg Monthly Saving</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(MONTHLY.reduce((s, d) => s + (d.income - d.expense), 0) / MONTHLY.length)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Best Month</p>
              <p className="text-lg font-bold text-emerald-400">June</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;