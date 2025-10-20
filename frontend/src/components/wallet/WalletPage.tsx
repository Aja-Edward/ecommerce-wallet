import React from "react";

const WalletPage: React.FC = () => {
  // Dummy data (replace with API or state later)
  const totalBalance = 125000.5;
  const wallets = [
    { name: "Main Wallet", amount: 80000 },
    { name: "Savings", amount: 30000 },
    { name: "Bonus", amount: 15000.5 },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Your Wallet</h1>
        <div className="bg-white shadow-md rounded-xl px-6 py-4">
          <span className="text-sm text-gray-500 block">Total Balance</span>
          <h2 className="text-3xl font-semibold text-gray-900">
            ₦{totalBalance.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {wallets.map((w, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
          >
            <span className="text-lg font-medium text-gray-600">{w.name}</span>
            <span className="text-2xl font-bold text-gray-900 mt-3">
              ₦{w.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 mt-10">
        <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl shadow hover:bg-blue-700 transition">
          Send Money
        </button>
        <button className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl shadow hover:bg-gray-300 transition">
          Add Money
        </button>
      </div>
    </div>
  );
};

export default WalletPage;
