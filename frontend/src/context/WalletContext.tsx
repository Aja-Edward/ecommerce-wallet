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
  useRef,
  useEffect,
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
  WalletTransferRequest,
  WalletTransferResponse,
  WalletUserLookupResponse,
  PaymentGateway,
  SavedContact,
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
  | { type: 'RESET_FUNDING_FORM' }
  | { type: 'SET_CONTACTS'; payload: SavedContact[] }
  | { type: 'ADD_CONTACT'; payload: SavedContact }
  | { type: 'REMOVE_CONTACT'; payload: string };

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
  contacts: [],
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
      return {
        ...state,
        currentTransaction: action.payload,
        isLoading: false,
        error: null,
      };

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

    case 'SET_CONTACTS':
      return {
        ...state,
        contacts: action.payload,
      };

    case 'ADD_CONTACT':
      return {
        ...state,
        contacts: [...state.contacts, action.payload],
      };

    case 'REMOVE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(c => c.username !== action.payload),
      };

    default:
      return state;
  }
}

// ─── Local Storage Keys ───────────────────────────────────────────────────────

const STORAGE_KEY = 'wallet_contacts';

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

  // ── Funding form ───────────────────────────────────────────────────────────

  const setFundingAmount = useCallback((amount: string) => {
    dispatch({ type: 'SET_FUNDING_FORM', payload: { amount } });
  }, []);

  const setFundingGateway = useCallback((gateway: PaymentGateway) => {
    dispatch({ type: 'SET_FUNDING_FORM', payload: { gateway } });
  }, []);

  /**
   * A ref mirror of fundingForm prevents stale closure reads inside
   * submitFunding without adding fundingForm to its dependency array
   * (which would recreate the callback on every keystroke).
   */
  const fundingFormRef = useRef(state.fundingForm);
  useEffect(() => {
    fundingFormRef.current = state.fundingForm;
  }, [state.fundingForm]);

  /**
   * Submit the funding form.
   * Validates → calls API → resets form → redirects to the external
   * payment gateway URL via window.location.href.
   *
   * window.location.href is intentional: Paystack / Flutterwave checkout
   * pages are external URLs, not internal React routes.
   */
  const submitFunding = useCallback(async () => {
    const { amount, gateway } = fundingFormRef.current;

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

      if (!response.payment_url) {
        dispatch({ type: 'SET_ERROR', payload: 'Payment URL not received. Please try again.' });
        return;
      }

      window.location.href = response.payment_url;
    } catch (err) {
      handleError(err);
      dispatch({ type: 'SET_FUNDING_LOADING', payload: false });
    }
  }, [handleError, fetchTransactions]);

  // ── User lookup ────────────────────────────────────────────────────────────

  /**
   * Look up a user by username to verify they exist and have an active wallet
   * before initiating a transfer. Returns display_name for confirmation UI.
   */
  const lookupUser = useCallback(
    async (username: string): Promise<WalletUserLookupResponse> => {
      try {
        return await WalletService.lookupUser(username);
      } catch (err) {
        throw err;
      }
    },
    []
  );

  // ── Wallet-to-wallet transfer ──────────────────────────────────────────────

  /**
   * Transfer funds from the authenticated user's wallet to another user.
   * On success, the context balance is updated immediately from the
   * response's new_balance — no extra GET /wallet/ round-trip needed.
   *
   * The caller (SendMoneyModal) is responsible for its own loading / error UI.
   * Errors are re-thrown so the modal can display them contextually without
   * also polluting the global walletError banner.
   */
  const submitTransfer = useCallback(
    async (request: WalletTransferRequest): Promise<WalletTransferResponse> => {
      try {
        const response = await WalletService.transferFunds(request);
        // Optimistically update balance from the API response
        dispatch({ type: 'SET_BALANCE', payload: response.new_balance });
        // Refresh the transaction list in the background
        await fetchTransactions(5);
        return response;
      } catch (err) {
        // Re-throw without touching global error state — the modal owns this error
        throw err;
      }
    },
    [fetchTransactions]
  );

  // ── Contact management ─────────────────────────────────────────────────────

  /**
   * Load saved contacts from localStorage on mount
   */
  const loadContacts = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const contacts = JSON.parse(stored) as SavedContact[];
        dispatch({ type: 'SET_CONTACTS', payload: contacts });
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }, []);

  /**
   * Add a new contact and persist to localStorage
   */
  const addContact = useCallback((contact: Omit<SavedContact, 'added_at'>) => {
    const newContact: SavedContact = {
      ...contact,
      added_at: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_CONTACT', payload: newContact });

    // Persist to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [...existing, newContact];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save contact:', err);
    }
  }, []);

  /**
   * Remove a contact by username and persist to localStorage
   */
  const removeContact = useCallback((username: string) => {
    dispatch({ type: 'REMOVE_CONTACT', payload: username });

    // Persist to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const existing = JSON.parse(stored) as SavedContact[];
        const updated = existing.filter(c => c.username !== username);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to remove contact:', err);
    }
  }, []);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

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
      initiateFunding,
      setFundingAmount,
      setFundingGateway,
      submitFunding,
      lookupUser,
      submitTransfer,
      loadContacts,
      addContact,
      removeContact,
      clearError,
    }),
    [
      state,
      fetchWallet,
      fetchBalance,
      fetchTransactions,
      fetchTransactionByReference,
      refreshWallet,
      initiateFunding,
      setFundingAmount,
      setFundingGateway,
      submitFunding,
      lookupUser,
      submitTransfer,
      loadContacts,
      addContact,
      removeContact,
      clearError,
    ]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet must be used within a <WalletProvider>.');
  }

  return context;
}

export default WalletContext;