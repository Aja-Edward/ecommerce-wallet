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
  PaymentGateway,
} from '../types/wallet.types';

import WalletService from '../services/wallet';

// ─── Actions ──────────────────────────────────────────────────────────────────

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WALLET'; payload: Wallet }
  | { type: 'SET_BALANCE'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: { transactions: WalletTransaction[]; count: number } }
  | { type: 'SET_CURRENT_TRANSACTION'; payload: WalletTransaction | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_FUNDING_FORM'; payload: Partial<{ amount: string; gateway: PaymentGateway }> }
  | { type: 'SET_FUNDING_LOADING'; payload: boolean }
  | { type: 'RESET_FUNDING_FORM' };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: WalletState = {
  wallet: null,
  balance: '0.00',
  transactions: [],
  transactionCount: 0,
  currentTransaction: null,
  isLoading: false,
  error: null,
  fundingForm: {
    amount: '',
    gateway: 'paystack',
    isLoading: false,
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

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

    case 'SET_FUNDING_FORM':
      return {
        ...state,
        fundingForm: { ...state.fundingForm, ...action.payload },
      };

    case 'SET_FUNDING_LOADING':
      return {
        ...state,
        fundingForm: { ...state.fundingForm, isLoading: action.payload },
      };

    case 'RESET_FUNDING_FORM':
      return {
        ...state,
        fundingForm: { amount: '', gateway: 'paystack', isLoading: false },
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // ── Error helper ───────────────────────────────────────────────────────────

  const handleError = useCallback((err: unknown) => {
    const message =
      typeof err === 'object' && err !== null && 'error' in err
        ? String((err as { error: unknown }).error)
        : err instanceof Error
        ? err.message
        : 'An unexpected error occurred.';
    dispatch({ type: 'SET_ERROR', payload: message });
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchWallet = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const wallet = await WalletService.getWallet();
      dispatch({ type: 'SET_WALLET', payload: wallet });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const fetchBalance = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { balance } = await WalletService.getBalance();
      dispatch({ type: 'SET_BALANCE', payload: balance });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

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

  const refreshWallet = useCallback(async () => {
    await Promise.all([fetchWallet(), fetchTransactions()]);
  }, [fetchWallet, fetchTransactions]);

  // ── Programmatic funding ───────────────────────────────────────────────────

  const initiateFunding = useCallback(
    async (request: WalletFundingRequest): Promise<WalletFundingResponse> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await WalletService.initiateFunding(request);
        await fetchTransactions();
        return response;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError, fetchTransactions]
  );

  // ── Funding form actions ───────────────────────────────────────────────────

  const setFundingAmount = useCallback((amount: string) => {
    dispatch({ type: 'SET_FUNDING_FORM', payload: { amount } });
  }, []);

  const setFundingGateway = useCallback((gateway: PaymentGateway) => {
    dispatch({ type: 'SET_FUNDING_FORM', payload: { gateway } });
  }, []);

  /**
   * Submit the funding form.
   * Validates, calls the API, resets the form, then redirects to the
   * payment gateway checkout page using window.location.href.
   *
   * NOTE: useNavigate() must NOT be called inside a useCallback —
   * it is a hook and can only be called at the top level of a component
   * or provider. We use window.location.href here intentionally because
   * the redirect is to an external payment gateway URL (Paystack / Flutterwave),
   * not an internal React route.
   */
  const fundingFormRef = React.useRef(state.fundingForm);

  React.useEffect(() => {
      fundingFormRef.current = state.fundingForm;
    }, [state.fundingForm]);
  const submitFunding = useCallback(async () => {
  const { amount, gateway } = fundingFormRef.current; // ← reads latest value, not stale closure

  console.log('🔍 Submitting with gateway:', gateway); // temporary debug log

  if (!amount || Number(amount) < 100) {
    dispatch({ type: 'SET_ERROR', payload: 'Minimum funding amount is ₦100.' });
    return;
  }

  dispatch({ type: 'SET_FUNDING_LOADING', payload: true });

  try {
    const response = await WalletService.initiateFunding({
      amount: Number(amount),
      payment_method: gateway,
      transaction_type: 'WALLET_FUNDING',
    });

    dispatch({ type: 'RESET_FUNDING_FORM' });
    await fetchTransactions();

    const paymentUrl = response.payment_url;

    if (!paymentUrl) {
      dispatch({ type: 'SET_ERROR', payload: 'Payment URL not received. Please try again.' });
      return;
    }

    window.location.href = paymentUrl;
  } catch (err) {
    handleError(err);
    dispatch({ type: 'SET_FUNDING_LOADING', payload: false });
  }
}, [handleError, fetchTransactions]); 

  // ── Misc ───────────────────────────────────────────────────────────────────

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────

  const contextValue = useMemo<WalletContextType>(
    () => ({
      ...state,
      fetchWallet,
      fetchBalance,
      fetchTransactions,
      fetchTransactionByReference,
      refreshWallet,
      setFundingAmount,
      setFundingGateway,
      submitFunding,
      initiateFunding,
      clearError,
    }),
    [
      state,
      fetchWallet,
      fetchBalance,
      fetchTransactions,
      fetchTransactionByReference,
      refreshWallet,
      setFundingAmount,
      setFundingGateway,
      submitFunding,
      initiateFunding,
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

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within a <WalletProvider>.');
  }

  return context;
}

export default WalletContext;