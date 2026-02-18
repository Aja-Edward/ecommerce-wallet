/**
 * Wallet Context
 * Provides wallet state and operations to the component tree.
 * Designed to be easily replaced/augmented with Redux Toolkit or Zustand later
 * — the WalletService layer stays untouched regardless of state manager.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
} from 'react';

import type {
  Wallet,
  WalletTransaction,
  WalletState,
  WalletContextType,
  WalletFundingRequest,
  WalletFundingResponse,
} from '../types/wallet.types';

import WalletService from '../services/wallet';

// ─── State & Actions ───────────────────────────────────────────────────────────

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WALLET'; payload: Wallet }
  | { type: 'SET_BALANCE'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: { transactions: WalletTransaction[]; count: number } }
  | { type: 'SET_CURRENT_TRANSACTION'; payload: WalletTransaction | null }
  | { type: 'CLEAR_ERROR' };

const initialState: WalletState = {
  wallet: null,
  balance: '0.00',
  transactions: [],
  transactionCount: 0,
  currentTransaction: null,
  isLoading: false,
  error: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_WALLET':
      return {
        ...state,
        wallet: action.payload,
        balance: action.payload.balance,
        isLoading: false,
        error: null,
      };

    case 'SET_BALANCE':
      return {
        ...state,
        balance: action.payload,
        // Keep wallet object in sync if it exists
        wallet: state.wallet ? { ...state.wallet, balance: action.payload } : null,
        isLoading: false,
        error: null,
      };

    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload.transactions,
        transactionCount: action.payload.count,
        isLoading: false,
        error: null,
      };

    case 'SET_CURRENT_TRANSACTION':
      return { ...state, currentTransaction: action.payload, isLoading: false, error: null };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const handleError = useCallback((err: unknown) => {
    const message =
      typeof err === 'object' && err !== null && 'error' in err
        ? String((err as { error: unknown }).error)
        : 'An unexpected error occurred.';
    dispatch({ type: 'SET_ERROR', payload: message });
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch full wallet details (balance + metadata).
   * Call on dashboard mount or after a funding/debit operation.
   */
  const fetchWallet = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const wallet = await WalletService.getWallet();
      dispatch({ type: 'SET_WALLET', payload: wallet });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  /**
   * Fetch only the current balance (lightweight, use for quick refreshes).
   */
  const fetchBalance = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { balance } = await WalletService.getBalance();
      dispatch({ type: 'SET_BALANCE', payload: balance });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  /**
   * Fetch transaction history.
   * @param limit  Optional cap; omit to fetch all transactions.
   */
  const fetchTransactions = useCallback(
    async (limit?: number) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { count, transactions } = await WalletService.getTransactions(limit);
        dispatch({ type: 'SET_TRANSACTIONS', payload: { transactions, count } });
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  /**
   * Fetch and store a single transaction by reference.
   * Useful for a transaction detail page/modal.
   */
  const fetchTransactionByReference = useCallback(
    async (reference: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const transaction = await WalletService.getTransactionByReference(reference);
        dispatch({ type: 'SET_CURRENT_TRANSACTION', payload: transaction });
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  /**
   * Initiate a wallet funding request.
   * Returns the funding response so the caller can redirect to the payment gateway.
   * Also refreshes wallet state after initiation to reflect the PENDING transaction.
   */
  const initiateFunding = useCallback(
    async (request: WalletFundingRequest): Promise<WalletFundingResponse> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await WalletService.initiateFunding(request);
        // Refresh transactions so the PENDING entry appears immediately
        await fetchTransactions();
        return response;
      } catch (err) {
        handleError(err);
        throw err; // re-throw so the calling component can react (e.g. show a toast)
      }
    },
    [handleError, fetchTransactions]
  );

  /**
   * Convenience: re-fetch both wallet details and recent transactions in one call.
   * Use after a payment gateway callback confirms a successful top-up.
   */
  const refreshWallet = useCallback(async () => {
    await Promise.all([fetchWallet(), fetchTransactions()]);
  }, [fetchWallet, fetchTransactions]);

  /**
   * Clear any error currently stored in state.
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ── Memoised context value ─────────────────────────────────────────────────
  // Memoising prevents unnecessary re-renders of every consumer when unrelated
  // state (e.g. a sibling context) changes.

  const contextValue = useMemo<WalletContextType>(
    () => ({
      // State
      ...state,
      // Actions
      fetchWallet,
      fetchBalance,
      fetchTransactions,
      fetchTransactionByReference,
      initiateFunding,
      refreshWallet,
      clearError,
    }),
    [
      state,
      fetchWallet,
      fetchBalance,
      fetchTransactions,
      fetchTransactionByReference,
      initiateFunding,
      refreshWallet,
      clearError,
    ]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useWallet
 * Consume wallet state and actions anywhere inside <WalletProvider>.
 *
 * @example
 * const { wallet, balance, fetchWallet, initiateFunding } = useWallet();
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within a <WalletProvider>.');
  }

  return context;
}

export default WalletContext;