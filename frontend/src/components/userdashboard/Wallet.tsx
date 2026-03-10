
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { formatCurrency, formatDate} from '../../types/utils';



const Wallet = () => {
    const { isAuthenticated } = useAuth();
      const {
        wallet,
        balance,
        isLoading: walletLoading,
        // error: walletError,
        fetchWallet,
        fetchTransactions,
        fundingForm,
        setFundingAmount,
        setFundingGateway,
        submitFunding,
    
      } = useWallet();   
      
      // ── Effects ─────────────────────────────────────────────────────────────────
    
      useEffect(() => {
        if (isAuthenticated) {
          fetchWallet();
          fetchTransactions(5);
        }
      }, [isAuthenticated, fetchWallet, fetchTransactions]);
    
      // Handle return from payment gateway (Paystack / Flutterwave redirect back)
      useEffect(() => {
        if (!isAuthenticated) return;
    
        const params = new URLSearchParams(window.location.search);
        const reference = params.get('payment_reference') ?? params.get('reference');
        const status = params.get('status');
    
        if (!reference || status !== 'completed') return;
    
        verifyPaymentAndRefresh(reference);
    
        async function verifyPaymentAndRefresh(ref: string) {
          const token = sessionStorage.getItem('access_token');
    
          // Always clear the query string, regardless of outcome
          window.history.replaceState({}, '', '/dashboard');
    
          if (!token) return;
    
          const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
    
          try {
            const res = await fetch(`${API_BASE}/wallet/verify/${ref}/`, {
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
      }, [isAuthenticated, fetchWallet, fetchTransactions]);

      const formattedBalance = walletLoading && !wallet ? '...' : formatCurrency(balance, 'NGN');
    
  return (
    <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                <div className="relative z-10">
                  <p className="text-blue-100 text-sm font-medium mb-2">Available Balance</p>
                  {walletLoading && !wallet ? (
                    <div className="h-16 w-52 bg-white/20 rounded-xl animate-pulse" />
                  ) : (
                    <p className="text-white text-6xl font-bold tracking-tight">{formattedBalance}</p>
                  )}
                  {wallet && (
                    <p className="text-blue-200 text-sm mt-3">Last updated {formatDate(wallet.updated_at)}</p>
                  )}
                </div>
              </div>

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
                    {fundingForm.isLoading ? 'Processing…' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            </div>
  )
}

export default Wallet