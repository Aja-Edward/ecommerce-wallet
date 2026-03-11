/**
 * CardContext.tsx
 * Provides all card state and actions to the component tree.
 * CardsPage and any child component reads from here — never calls the service directly.
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import CardService from "../services/card_services";
import type 
{
  Card,
  CardStats,
  CardTransaction,
  CreateCardPayload,
  PaginatedResponse,
  TransactionFilters,
  UpdateCardPayload,
} from "../types/cards_types";

// ─── State shape ──────────────────────────────────────────────────────────────

interface CardState {
  // Cards
  cards: Card[];
  cardsLoading: boolean;
  cardsError: string | null;

  // Stats
  stats: CardStats | null;
  statsLoading: boolean;

  // Transactions
  transactions: CardTransaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  transactionsMeta: {
    count: number;
    next: string | null;
    previous: string | null;
  };

  // Active filters (synced with the frontend dropdown + filter controls)
  activeFilters: TransactionFilters;

  // Per-card action loading state — keyed by card id
  // e.g. { "uuid-123": "freezing" }
  cardActionLoading: Record<string, CardAction | null>;
}

type CardAction =
  | "freezing"
  | "unfreezing"
  | "blocking"
  | "setting-default"
  | "updating"
  | "creating";

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_CARDS"; payload: Card[] }
  | { type: "SET_CARDS_LOADING"; payload: boolean }
  | { type: "SET_CARDS_ERROR"; payload: string | null }
  | { type: "ADD_CARD"; payload: Card }
  | { type: "UPDATE_CARD"; payload: Card }
  | { type: "SET_STATS"; payload: CardStats }
  | { type: "SET_STATS_LOADING"; payload: boolean }
  | { type: "SET_TRANSACTIONS"; payload: PaginatedResponse<CardTransaction> }
  | { type: "SET_TRANSACTIONS_LOADING"; payload: boolean }
  | { type: "SET_TRANSACTIONS_ERROR"; payload: string | null }
  | { type: "SET_ACTIVE_FILTERS"; payload: TransactionFilters }
  | { type: "SET_CARD_ACTION_LOADING"; payload: { id: string; action: CardAction | null } };

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: CardState = {
  cards: [],
  cardsLoading: false,
  cardsError: null,

  stats: null,
  statsLoading: false,

  transactions: [],
  transactionsLoading: false,
  transactionsError: null,
  transactionsMeta: { count: 0, next: null, previous: null },

  activeFilters: {},
  cardActionLoading: {},
};

function reducer(state: CardState, action: Action): CardState {
  switch (action.type) {
    case "SET_CARDS":
      return { ...state, cards: action.payload, cardsError: null };

    case "SET_CARDS_LOADING":
      return { ...state, cardsLoading: action.payload };

    case "SET_CARDS_ERROR":
      return { ...state, cardsError: action.payload };

    case "ADD_CARD":
      return { ...state, cards: [action.payload, ...state.cards] };

    // Merge the updated card into the list in-place
    case "UPDATE_CARD":
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case "SET_STATS":
      return { ...state, stats: action.payload };

    case "SET_STATS_LOADING":
      return { ...state, statsLoading: action.payload };

    case "SET_TRANSACTIONS":
      return {
        ...state,
        transactions: action.payload.results,
        transactionsMeta: {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
        },
        transactionsError: null,
      };

    case "SET_TRANSACTIONS_LOADING":
      return { ...state, transactionsLoading: action.payload };

    case "SET_TRANSACTIONS_ERROR":
      return { ...state, transactionsError: action.payload };

    case "SET_ACTIVE_FILTERS":
      return { ...state, activeFilters: action.payload };

    case "SET_CARD_ACTION_LOADING":
      return {
        ...state,
        cardActionLoading: {
          ...state.cardActionLoading,
          [action.payload.id]: action.payload.action,
        },
      };

    default:
      return state;
  }
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface CardContextValue extends CardState {
  // Data fetching
  fetchCards: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;

  // Card mutations
  createCard: (payload: CreateCardPayload) => Promise<Card>;
  updateCard: (id: string, payload: UpdateCardPayload) => Promise<Card>;
  freezeCard: (id: string) => Promise<void>;
  unfreezeCard: (id: string) => Promise<void>;
  blockCard: (id: string) => Promise<void>;
  setDefaultCard: (id: string) => Promise<void>;

  // Filter helpers (used by the "All Cards" dropdown + any filter UI)
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;

  // Derived helpers
  getCardById: (id: string) => Card | undefined;
  defaultCard: Card | undefined;
}

// ─── Context creation ─────────────────────────────────────────────────────────

const CardContext = createContext<CardContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Prevent running effects after unmount
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // ── Fetch cards ────────────────────────────────────────────────────────────

  const fetchCards = useCallback(async () => {
    dispatch({ type: "SET_CARDS_LOADING", payload: true });
    try {
      const cards = await CardService.getCards();
      if (mounted.current) {
        dispatch({ type: "SET_CARDS", payload: cards });
      }
    } catch (err: any) {
      if (mounted.current) {
        dispatch({
          type: "SET_CARDS_ERROR",
          payload: err?.response?.data?.detail ?? "Failed to load cards.",
        });
      }
    } finally {
      if (mounted.current) {
        dispatch({ type: "SET_CARDS_LOADING", payload: false });
      }
    }
  }, []);

  // ── Fetch stats ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    dispatch({ type: "SET_STATS_LOADING", payload: true });
    try {
      const stats = await CardService.getCardStats();
      if (mounted.current) {
        dispatch({ type: "SET_STATS", payload: stats });
      }
    } finally {
      if (mounted.current) {
        dispatch({ type: "SET_STATS_LOADING", payload: false });
      }
    }
  }, []);

  // ── Fetch transactions ─────────────────────────────────────────────────────

  const fetchTransactions = useCallback(
    async (filters: TransactionFilters = {}) => {
      dispatch({ type: "SET_TRANSACTIONS_LOADING", payload: true });
      // Merge with any already-active filters so the call site
      // can just pass a delta (e.g. just { card_last_four: "4532" })
      const merged = { ...state.activeFilters, ...filters };
      try {
        const result = await CardService.getTransactions(merged);
        if (mounted.current) {
          dispatch({ type: "SET_TRANSACTIONS", payload: result });
        }
      } catch (err: any) {
        if (mounted.current) {
          dispatch({
            type: "SET_TRANSACTIONS_ERROR",
            payload: err?.response?.data?.detail ?? "Failed to load transactions.",
          });
        }
      } finally {
        if (mounted.current) {
          dispatch({ type: "SET_TRANSACTIONS_LOADING", payload: false });
        }
      }
    },
    [state.activeFilters]
  );

  // ── Create card ────────────────────────────────────────────────────────────

  const createCard = useCallback(async (payload: CreateCardPayload): Promise<Card> => {
    const card = await CardService.createCard(payload);
    dispatch({ type: "ADD_CARD", payload: card });
    // Refresh stats since a new card changes limits
    fetchStats();
    return card;
  }, [fetchStats]);

  // ── Update card ────────────────────────────────────────────────────────────

  const updateCard = useCallback(
    async (id: string, payload: UpdateCardPayload): Promise<Card> => {
      dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: "updating" } });
      try {
        const updated = await CardService.updateCard(id, payload);
        dispatch({ type: "UPDATE_CARD", payload: updated });
        return updated;
      } finally {
        dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: null } });
      }
    },
    []
  );

  // ── Freeze ─────────────────────────────────────────────────────────────────

  const freezeCard = useCallback(async (id: string) => {
    dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: "freezing" } });
    try {
      const updated = await CardService.freezeCard(id);
      dispatch({ type: "UPDATE_CARD", payload: updated });
    } finally {
      dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: null } });
    }
  }, []);

  // ── Unfreeze ───────────────────────────────────────────────────────────────

  const unfreezeCard = useCallback(async (id: string) => {
    dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: "unfreezing" } });
    try {
      const updated = await CardService.unfreezeCard(id);
      dispatch({ type: "UPDATE_CARD", payload: updated });
    } finally {
      dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: null } });
    }
  }, []);

  // ── Block ──────────────────────────────────────────────────────────────────

  const blockCard = useCallback(async (id: string) => {
    dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: "blocking" } });
    try {
      const updated = await CardService.blockCard(id);
      dispatch({ type: "UPDATE_CARD", payload: updated });
    } finally {
      dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: null } });
    }
  }, []);

  // ── Set default ────────────────────────────────────────────────────────────

  const setDefaultCard = useCallback(async (id: string) => {
    dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: "setting-default" } });
    try {
      const updated = await CardService.setDefaultCard(id);
      // The backend clears is_default on all other cards, so re-fetch the full list
      await fetchCards();
      dispatch({ type: "UPDATE_CARD", payload: updated });
    } finally {
      dispatch({ type: "SET_CARD_ACTION_LOADING", payload: { id, action: null } });
    }
  }, [fetchCards]);

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const setFilters = useCallback((filters: TransactionFilters) => {
    const merged = { ...state.activeFilters, ...filters };
    dispatch({ type: "SET_ACTIVE_FILTERS", payload: merged });
    // Immediately re-fetch with new filters applied
    fetchTransactions(merged);
  }, [state.activeFilters, fetchTransactions]);

  const clearFilters = useCallback(() => {
    dispatch({ type: "SET_ACTIVE_FILTERS", payload: {} });
    fetchTransactions({});
  }, [fetchTransactions]);

  // ── Derived helpers ────────────────────────────────────────────────────────

  const getCardById = useCallback(
    (id: string) => state.cards.find((c) => c.id === id),
    [state.cards]
  );

  const defaultCard = state.cards.find((c) => c.is_default);

  // ── Initial load ───────────────────────────────────────────────────────────

  useEffect(() => {
    fetchCards();
    fetchStats();
    fetchTransactions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value: CardContextValue = {
    ...state,
    fetchCards,
    fetchStats,
    fetchTransactions,
    createCard,
    updateCard,
    freezeCard,
    unfreezeCard,
    blockCard,
    setDefaultCard,
    setFilters,
    clearFilters,
    getCardById,
    defaultCard,
  };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

// ─── Consumer hook ─────────────────────────────────────────────────────────────

export function useCards(): CardContextValue {
  const ctx = useContext(CardContext);
  if (!ctx) {
    throw new Error("useCards must be used inside <CardProvider>");
  }
  return ctx;
}

export default CardContext;