// pages/dashboard/CardsPage.tsx
// const CARDS = [
//   {
//     id: 1,
//     type: 'Visa',
//     number: '**** **** **** 4532',
//     holder: 'John Doe',
//     expiry: '12/26',
//     balance: 1_250_000,
//     color: 'from-blue-600 to-blue-800',
//     accent: '#3b82f6',
//   },
//   {
//     id: 2,
//     type: 'Mastercard',
//     number: '**** **** **** 7891',
//     holder: 'John Doe',
//     expiry: '08/25',
//     balance: 480_500,
//     color: 'from-orange-500 to-red-600',
//     accent: '#f97316',
//   },
//   {
//     id: 3,
//     type: 'Visa',
//     number: '**** **** **** 1123',
//     holder: 'John Doe',
//     expiry: '03/27',
//     balance: 3_200_000,
//     color: 'from-emerald-500 to-teal-700',
//     accent: '#10b981',
//   },
// ];

// const RECENT_CARD_TRANSACTIONS = [
//   { id: 1, merchant: 'Apple Store', category: 'Shopping', amount: -129_000, date: '2 hours ago', icon: '🍎' },
//   { id: 2, merchant: 'Netflix', category: 'Entertainment', amount: -4_600, date: 'Yesterday', icon: '🎬' },
//   { id: 3, merchant: 'Bolt Food', category: 'Food & Dining', amount: -8_200, date: '2 days ago', icon: '🍔' },
//   { id: 4, merchant: 'Salary Credit', category: 'Income', amount: 450_000, date: '5 days ago', icon: '💼' },
//   { id: 5, merchant: 'MTN Airtime', category: 'Utilities', amount: -5_000, date: '6 days ago', icon: '📱' },
// ];

// const formatCurrency = (n: number) =>
//   new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Math.abs(n));

// const Cards = () => {
//   return (
//     <div className="space-y-8">
//       {/* Cards grid */}
//       <div>
//         <div className="flex items-center justify-between mb-5">
//           <h2 className="text-lg font-semibold text-white">My Cards</h2>
//           <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
//             <span>+</span> Add New Card
//           </button>
//         </div>

//         <div className="grid grid-cols-3 gap-5">
//           {CARDS.map((card) => (
//             <div
//               key={card.id}
//               className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200`}
//             >
//               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
//               <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full -ml-14 -mb-14" />
//               <div className="relative z-10">
//                 <div className="flex items-center justify-between mb-8">
//                   <span className="text-white/80 text-sm font-medium">{card.type}</span>
//                   <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
//                     <span className="text-white text-sm">💳</span>
//                   </div>
//                 </div>
//                 <p className="text-white text-lg font-mono tracking-widest mb-6">{card.number}</p>
//                 <div className="flex items-end justify-between">
//                   <div>
//                     <p className="text-white/60 text-xs mb-1">Card Holder</p>
//                     <p className="text-white text-sm font-semibold">{card.holder}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-white/60 text-xs mb-1">Expires</p>
//                     <p className="text-white text-sm font-semibold">{card.expiry}</p>
//                   </div>
//                 </div>
//                 <div className="mt-4 pt-4 border-t border-white/20">
//                   <p className="text-white/60 text-xs mb-1">Balance</p>
//                   <p className="text-white text-xl font-bold">{formatCurrency(card.balance)}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Stats row */}
//       <div className="grid grid-cols-4 gap-4">
//         {[
//           { label: 'Total Limit', value: '₦10,000,000', icon: '🏦', color: 'text-blue-400' },
//           { label: 'Used Credit', value: '₦4,930,500', icon: '📊', color: 'text-orange-400' },
//           { label: 'Available', value: '₦5,069,500', icon: '✅', color: 'text-emerald-400' },
//           { label: 'Cashback', value: '₦12,300', icon: '🎁', color: 'text-purple-400' },
//         ].map((stat) => (
//           <div key={stat.label} className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-5">
//             <div className="flex items-center gap-3 mb-3">
//               <span className="text-2xl">{stat.icon}</span>
//               <p className="text-sm text-gray-400">{stat.label}</p>
//             </div>
//             <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Recent card transactions */}
//       <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
//         <div className="flex items-center justify-between mb-5">
//           <h3 className="text-lg font-semibold text-white">Recent Card Activity</h3>
//           <select className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
//             <option>All Cards</option>
//             <option>**** 4532</option>
//             <option>**** 7891</option>
//             <option>**** 1123</option>
//           </select>
//         </div>
//         <div className="space-y-1">
//           {RECENT_CARD_TRANSACTIONS.map((txn) => (
//             <div key={txn.id} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-800/30 transition-colors">
//               <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg">
//                 {txn.icon}
//               </div>
//               <div className="flex-1">
//                 <p className="text-sm font-medium text-white">{txn.merchant}</p>
//                 <p className="text-xs text-gray-500">{txn.category} · {txn.date}</p>
//               </div>
//               <span className={`font-semibold text-sm ${txn.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
//                 {txn.amount > 0 ? '+' : '-'}{formatCurrency(txn.amount)}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cards;

/**
 * Cards Component
 * Connected to CardContext — no more hardcoded data!
 */

import { useState } from 'react';
import { useCard } from '../../context/CardContext';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Math.abs(n));

const Cards = () => {
  const {
    cards,
    stats,
    transactions,
    isLoading,
    error,
    addCard,
    deleteCard,
    clearError,
  } = useCard();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    type: '',
    number: '',
    holder: '',
    expiry: '',
    balance: 0,
    color: 'from-blue-600 to-blue-800',
    accent: '#3b82f6',
  });

  const handleAddCard = async () => {
    if (!newCard.type || !newCard.number || !newCard.holder || !newCard.expiry) return;
    await addCard(newCard);
    setShowAddModal(false);
    setNewCard({
      type: '',
      number: '',
      holder: '',
      expiry: '',
      balance: 0,
      color: 'from-blue-600 to-blue-800',
      accent: '#3b82f6',
    });
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Are you sure you want to remove this card?')) {
      await deleteCard(id);
    }
  };

  if (isLoading && cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm animate-pulse">Loading cards...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={clearError} className="text-red-400 hover:text-red-300 text-lg leading-none">✕</button>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">My Cards</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <span>+</span> Add New Card
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">💳</p>
            <p className="text-sm">No cards yet. Add your first card!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full -ml-14 -mb-14" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-white/80 text-sm font-medium">{card.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">💳</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="w-8 h-8 bg-red-500/30 hover:bg-red-500/60 rounded-full flex items-center justify-center transition-colors"
                        title="Remove card"
                      >
                        <span className="text-white text-xs">✕</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-white text-lg font-mono tracking-widest mb-6">{card.number}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/60 text-xs mb-1">Card Holder</p>
                      <p className="text-white text-sm font-semibold">{card.holder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs mb-1">Expires</p>
                      <p className="text-white text-sm font-semibold">{card.expiry}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/60 text-xs mb-1">Balance</p>
                    <p className="text-white text-xl font-bold">{formatCurrency(card.balance)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Limit', value: formatCurrency(stats.total_limit), icon: '🏦', color: 'text-blue-400' },
            { label: 'Used Credit', value: formatCurrency(stats.used_credit), icon: '📊', color: 'text-orange-400' },
            { label: 'Available', value: formatCurrency(stats.available), icon: '✅', color: 'text-emerald-400' },
            { label: 'Cashback', value: formatCurrency(stats.cashback), icon: '🎁', color: 'text-purple-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Recent Card Activity</h3>
          <select className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 focus:outline-none">
            <option>All Cards</option>
            {cards.map((card) => (
              <option key={card.id}>{card.number.slice(-9)}</option>
            ))}
          </select>
        </div>

        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">No transactions yet.</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-800/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg">
                  {txn.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{txn.merchant}</p>
                  <p className="text-xs text-gray-500">{txn.category} · {txn.date}</p>
                </div>
                <span className={`font-semibold text-sm ${txn.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {txn.amount > 0 ? '+' : '-'}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f1629] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-5">Add New Card</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Card Type</label>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none"
                >
                  <option value="">Select type</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Verve">Verve</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Card Number</label>
                <input
                  type="text"
                  placeholder="**** **** **** 0000"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Card Holder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newCard.holder}
                  onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cards;