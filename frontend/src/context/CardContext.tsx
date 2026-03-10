/**
 * Card Context
 * Provides card state and operations to the component tree.
 * Follows the same pattern as WalletContext.tsx
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import CardService, {
  type Card,
  type CardStats,
  type CardTransaction,
} from '../services/card';

// ─── State Type ───────────────────────────────────────────────────────────────

interface CardState {
  cards: Card[];
  stats: CardStats | null;
  transactions: CardTransaction[];
  isLoading: boolean;
  error: string | null;
}

// ─── Context Type ─────────────────────────────────────────────────────────────

interface CardContextType extends CardState {
  fetchCards: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addCard: (card: Omit<Card, 'id'>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  clearError: () => void;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type CardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'REMOVE_CARD'; payload: string }
  | { type: 'SET_STATS'; payload: CardStats }
  | { type: 'SET_TRANSACTIONS'; payload: CardTransaction[] }
  | { type: 'CLEAR_ERROR' };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: CardState = {
  cards: [],
  stats: null,
  transactions: [],
  isLoading: false,
  error: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_CARDS':
      return { ...state, cards: action.payload, isLoading: false, error: null };

    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, action.payload],
        isLoading: false,
        error: null,
      };

    case 'REMOVE_CARD':
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.payload),
        isLoading: false,
        error: null,
      };

    case 'SET_STATS':
      return { ...state, stats: action.payload, isLoading: false, error: null };

    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, isLoading: false, error: null };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CardContext = createContext<CardContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cardReducer, initialState);

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

  // ── Fetch cards ────────────────────────────────────────────────────────────

  const fetchCards = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cards = await CardService.getCards();
      dispatch({ type: 'SET_CARDS', payload: cards });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // ── Fetch stats ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const stats = await CardService.getStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // ── Fetch transactions ─────────────────────────────────────────────────────

  const fetchTransactions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const transactions = await CardService.getTransactions();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // ── Add card ───────────────────────────────────────────────────────────────

  const addCard = useCallback(
    async (card: Omit<Card, 'id'>) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const newCard = await CardService.addCard(card);
        dispatch({ type: 'ADD_CARD', payload: newCard });
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  // ── Delete card ────────────────────────────────────────────────────────────

  const deleteCard = useCallback(
    async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await CardService.deleteCard(id);
        dispatch({ type: 'REMOVE_CARD', payload: id });
      } catch (err) {
        handleError(err);
      }
    },
    [handleError]
  );

  // ── Clear error ────────────────────────────────────────────────────────────

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // ── Fetch everything on mount ──────────────────────────────────────────────

  useEffect(() => {
    fetchCards();
    fetchStats();
    fetchTransactions();
  }, [fetchCards, fetchStats, fetchTransactions]);

  // ── Context value ──────────────────────────────────────────────────────────

  const contextValue = useMemo<CardContextType>(
    () => ({
      ...state,
      fetchCards,
      fetchStats,
      fetchTransactions,
      addCard,
      deleteCard,
      clearError,
    }),
    [state, fetchCards, fetchStats, fetchTransactions, addCard, deleteCard, clearError]
  );

  return (
    <CardContext.Provider value={contextValue}>
      {children}
    </CardContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCard(): CardContextType {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCard must be used within a <CardProvider>.');
  }
  return context;
}

export default CardContext;