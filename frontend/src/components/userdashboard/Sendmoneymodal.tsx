/**
 * SendMoneyModal
 * Handles wallet-to-wallet transfers between users.
 * Opens when the user clicks "Send" in the Quick Transfer section.
 *
 * Receives submitTransfer from WalletContext via Dashboard — no raw fetch
 * calls here, keeping auth and error handling centralised in the service layer.
 */

import { useState, useCallback, useRef } from 'react';
import { formatCurrency } from '../../types/utils';
import { useWallet } from '../../context/WalletContext';
import type { WalletTransferRequest, WalletTransferResponse, WalletUserLookupResponse } from '../../types/wallet.types';

// ─── Types ────────────────────────────────────────────────────────────────────


interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Raw balance string from context e.g. "5000.00" */
  currentBalance: string;
  // submitTransfer: (request: WalletTransferRequest) => Promise<WalletTransferResponse>;
  onTransferSuccess: () => void;
}

type Step = 'form' | 'confirm' | 'success' | 'error';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const PRESET_AMOUNTS = [500, 1000, 5000, 10000] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const SendMoneyModal = ({
  isOpen,
  onClose,
  currentBalance,
  // submitTransfer,
  onTransferSuccess,
}: SendMoneyModalProps) => {
  const { submitTransfer } = useWallet();

  const [step, setStep]                           = useState<Step>('form');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [amount, setAmount]                       = useState('');
  const [note, setNote]                           = useState('');
  const [isLoading, setIsLoading]                 = useState(false);
  const [isLookingUp, setIsLookingUp]             = useState(false);
  const [recipientName, setRecipientName]         = useState<string | null>(null);
  const [lookupError, setLookupError]             = useState<string | null>(null);
  const [transferResult, setTransferResult]       = useState<WalletTransferResponse | null>(null);
  const [errorMessage, setErrorMessage]           = useState<string | null>(null);

  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const numBalance = parseFloat(currentBalance) || 0;
  const numAmount  = parseFloat(amount) || 0;

  const isInsufficientFunds = numAmount > 0 && numAmount > numBalance;
  const isBelowMinimum      = numAmount > 0 && numAmount < 10;
  const canProceed =
    !!recipientName && numAmount >= 10 && !isInsufficientFunds && !isLookingUp;

  // ── Recipient lookup ────────────────────────────────────────────────────────

  const lookupRecipient = useCallback(async (username: string) => {
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      setRecipientName(null);
      setLookupError(null);
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setRecipientName(null);

    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) throw new Error('Not authenticated');

      const res  = await fetch(
        `${API_BASE}/wallet/lookup-user/?username=${encodeURIComponent(trimmed)}`,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const data: WalletUserLookupResponse & { error?: string } = await res.json();

      if (res.ok && data.username) {
        setRecipientName(data.email);
      } else {
        setLookupError(data.error ?? 'User not found.');
      }
    } catch {
      setLookupError('Could not look up user. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  const handleUsernameChange = (val: string) => {
    setRecipientUsername(val);
    setRecipientName(null);
    setLookupError(null);
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(() => lookupRecipient(val), 600);
  };

  // ── Transfer submission ─────────────────────────────────────────────────────

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await submitTransfer({
        recipient_username: recipientUsername.trim(),
        amount: numAmount,
        ...(note.trim() ? { note: note.trim() } : {}),
      });

      setTransferResult(response);
      setStep('success');
      onTransferSuccess();
    } catch (err) {
      const message =
        typeof err === 'object' && err !== null && 'error' in err
          ? String((err as { error: unknown }).error)
          : err instanceof Error
          ? err.message
          : 'Transfer failed. Please try again.';
      setErrorMessage(message);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────

  const handleClose = () => {
    setStep('form');
    setRecipientUsername('');
    setAmount('');
    setNote('');
    setRecipientName(null);
    setLookupError(null);
    setTransferResult(null);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="relative w-full max-w-md bg-[#0f1629] border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden"
        style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            {step === 'confirm' && (
              <button
                onClick={() => setStep('form')}
                className="p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors mr-1"
              >
                ←
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-base">💸</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">
                {step === 'form'    && 'Send Money'}
                {step === 'confirm' && 'Confirm Transfer'}
                {step === 'success' && 'Transfer Sent!'}
                {step === 'error'   && 'Transfer Failed'}
              </h2>
              {step === 'form' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Balance:{' '}
                  <span className="text-emerald-400 font-medium">
                    {formatCurrency(currentBalance, 'NGN')}
                  </span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* ── Form step ──────────────────────────────────────────────────── */}
        {step === 'form' && (
          <div className="p-6 space-y-5">
            {/* Recipient */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Recipient Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="e.g. john_doe"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 transition-colors pr-10"
                />
                {isLookingUp && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin">⟳</span>
                )}
                {recipientName && !isLookingUp && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">✓</span>
                )}
              </div>

              {recipientName && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {recipientName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-emerald-400 font-medium">{recipientName}</p>
                    <p className="text-xs text-gray-500">Verified recipient</p>
                  </div>
                </div>
              )}
              {lookupError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> {lookupError}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min={10}
                  className="w-full pl-9 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 transition-colors text-lg font-semibold"
                />
              </div>
              {isInsufficientFunds && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <span>⚠</span> Insufficient balance
                </p>
              )}
              {isBelowMinimum && (
                <p className="mt-2 text-xs text-orange-400 flex items-center gap-1">
                  <span>⚠</span> Minimum transfer is ₦10
                </p>
              )}
              <div className="flex gap-2 mt-3">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(String(preset))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      numAmount === preset
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {preset >= 1000 ? `₦${preset / 1000}k` : `₦${preset}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">
                Note <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. For dinner last night"
                maxLength={100}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!canProceed}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Review Transfer</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* ── Confirm step ───────────────────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="p-6 space-y-5">
            <div className="bg-gray-800/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">To</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {(recipientName ?? '?').slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-white">{recipientName}</span>
                </div>
              </div>
              <div className="border-t border-gray-700/50" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Amount</span>
                <span className="text-xl font-bold text-white">{formatCurrency(numAmount, 'NGN')}</span>
              </div>
              {note.trim() && (
                <>
                  <div className="border-t border-gray-700/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Note</span>
                    <span className="text-sm text-gray-300">{note}</span>
                  </div>
                </>
              )}
              <div className="border-t border-gray-700/50" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Balance after</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {formatCurrency(numBalance - numAmount, 'NGN')}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Please confirm the details above. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block">⟳</span>
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Send</span>
                    <span>💸</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Success step ───────────────────────────────────────────────── */}
        {step === 'success' && transferResult && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-4xl">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Money Sent!</h3>
              <p className="text-gray-400 text-sm">
                {formatCurrency(transferResult.amount, 'NGN')} sent to{' '}
                <span className="text-white font-medium">{transferResult.recipient_name}</span>
              </p>
            </div>
            <div className="w-full bg-gray-800/40 rounded-xl px-5 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="text-gray-300 font-mono text-xs">
                  {transferResult.reference.slice(0, 20)}…
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New Balance</span>
                <span className="text-emerald-400 font-semibold">
                  {formatCurrency(transferResult.new_balance, 'NGN')}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors mt-2"
            >
              Done
            </button>
          </div>
        )}

        {/* ── Error step ─────────────────────────────────────────────────── */}
        {step === 'error' && (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-4xl">
              ✕
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Transfer Failed</h3>
              <p className="text-gray-400 text-sm">{errorMessage}</p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoneyModal;