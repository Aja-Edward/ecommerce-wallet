/**
 * Card Service
 * API service layer for all card-related operations
 */

import type { ApiError } from '../types/api.types';

// ─── Base Configuration ───────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const CARD_BASE = `${API_BASE_URL}/cards`;

// ─── Token Helper ─────────────────────────────────────────────────────────────

const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('access_token');
};

// ─── Fetch Wrapper ────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

async function cardFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options;

  const token = getAccessToken();
  if (!token) {
    throw { error: 'Unauthenticated: no access token found.', status: 401 } as ApiError;
  }

  const url = new URL(endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiError: ApiError = {
      error: json.error ?? json.detail ?? 'An unexpected error occurred.',
      detail: json.detail,
      errors: json.errors,
      status: response.status,
    };
    throw apiError;
  }
  return json as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Card {
  id: string;
  type: string;
  number: string;
  holder: string;
  expiry: string;
  balance: number;
  color: string;
  accent: string;
}

export interface CardStats {
  total_limit: number;
  used_credit: number;
  available: number;
  cashback: number;
}

export interface CardTransaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  icon: string;
}

// ─── Card Service ─────────────────────────────────────────────────────────────

const CardService = {
  /**
   * GET /api/cards/
   * Get all cards for the authenticated user
   */
  getCards(): Promise<Card[]> {
    return cardFetch<Card[]>(`${CARD_BASE}/`);
  },

  /**
   * POST /api/cards/
   * Add a new card
   */
  addCard(card: Omit<Card, 'id'>): Promise<Card> {
    return cardFetch<Card>(`${CARD_BASE}/`, {
      method: 'POST',
      body: card,
    });
  },

  /**
   * DELETE /api/cards/:id/
   * Remove a card by ID
   */
  deleteCard(id: string): Promise<void> {
    return cardFetch<void>(`${CARD_BASE}/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/cards/stats/
   * Get aggregated card stats
   */
  getStats(): Promise<CardStats> {
    return cardFetch<CardStats>(`${CARD_BASE}/stats/`);
  },

  /**
   * GET /api/cards/transactions/
   * Get all card transactions
   */
  getTransactions(): Promise<CardTransaction[]> {
    return cardFetch<CardTransaction[]>(`${CARD_BASE}/transactions/`);
  },

  /**
   * GET /api/cards/transactions/:id/
   * Get a single card transaction
   */
  getTransactionById(id: string): Promise<CardTransaction> {
    return cardFetch<CardTransaction>(`${CARD_BASE}/transactions/${id}/`);
  },
};

export default CardService;