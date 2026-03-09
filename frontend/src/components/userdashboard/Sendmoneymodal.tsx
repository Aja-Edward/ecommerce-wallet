import { useState, useEffect } from 'react';
import { formatCurrency } from '../../types/utils';
import type { WalletTransferRequest } from '../../types/wallet.types';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: string;
  submitTransfer: (request: WalletTransferRequest) => Promise<any>;
  onTransferSuccess?: () => void;
  prefilledRecipient?: string;
}

const SendMoneyModal = ({
  isOpen,
  onClose,
  currentBalance,
  submitTransfer,
  onTransferSuccess,
  prefilledRecipient,
}: SendMoneyModalProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const balanceNum = parseFloat(currentBalance.replace(/[^0-9.-]+/g, ''));

  // Prefill recipient if provided
  useEffect(() => {
    if (prefilledRecipient) {
      setRecipient(prefilledRecipient);
    }
  }, [prefilledRecipient]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setRecipient('');
        setAmount('');
        setDescription('');
        setError(null);
        setSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!recipient.trim()) {
      setError('Please enter a recipient username');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < 100) {
      setError('Minimum transfer amount is ₦100');
      return;
    }

    if (amountNum > balanceNum) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);

    try {
      const request: WalletTransferRequest = {
        recipient_username: recipient.trim(),
        amount: amountNum,
        description: description.trim() || undefined,
      };

      await submitTransfer(request);

      setSuccess(true);
      onTransferSuccess?.();

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.error || 'Transfer failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f1629] border border-gray-800/50 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Send Money</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-lg font-semibold text-white mb-2">Transfer Successful!</p>
            <p className="text-sm text-gray-400">
              {formatCurrency(parseFloat(amount), 'NGN')} sent to @{recipient}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Available balance */}
            <div className="px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Available Balance</p>
              <p className="text-lg font-bold text-white">{formatCurrency(balanceNum, 'NGN')}</p>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Recipient Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. johndoe"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={isLoading || !!prefilledRecipient}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount (₦) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                placeholder="0.00"
                min="100"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: ₦100</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Payment for lunch"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !recipient || !amount}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block">⏳</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>💸</span>
                  <span>Send Money</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendMoneyModal;