/**
 * card-service.ts
 * All HTTP communication with the Django cards backend.
 * Follows the same fetch-based pattern as wallet-service.ts.
 * The context layer calls these functions — nothing else should.
 */

import type { ApiError } from "../types/api.types";
import { API_BASE_URL } from "./api";
import type {
  Card,
  CardTransaction,
  CardStats,
  PaginatedResponse,
  CreateCardPayload,
  UpdateCardPayload,
  TransactionFilters,  
} from "../types/cards_types";

// ─── Base Configuration ────────────────────────────────────────────────────────
const CARDS_BASE = `${API_BASE_URL}/cards`;

// ─── Token Helper ──────────────────────────────────────────────────────────────

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
};

// ─── Fetch Wrapper ─────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

async function cardFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params } = options;

  const token = getAccessToken();
  if (!token) {
    throw { error: "Unauthenticated: no access token found.", status: 401 } as ApiError;
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiError: ApiError = {
      error: json.error ?? json.detail ?? "An unexpected error occurred.",
      detail: json.detail,
      errors: json.errors,
      status: response.status,
    };
    throw apiError;
  }

  return json as T;
}

// ─── Filter Builder ────────────────────────────────────────────────────────────
// Converts a TransactionFilters object into a flat params record,
// stripping out any undefined / empty values before they hit the URL.

function buildFilterParams(
  filters: TransactionFilters
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "" && value !== null
    )
  ) as Record<string, string | number | boolean>;
}

// ─── Card Service ──────────────────────────────────────────────────────────────

const CardService = {

  // ── Cards ──────────────────────────────────────────────────────────────────

  /**
   * GET /cards/
   * Returns all cards for the authenticated user.
   */
  getCards(): Promise<Card[]> {
    return cardFetch<Card[]>(`${CARDS_BASE}/`);
  },

  /**
   * GET /cards/{id}/
   */
  getCard(id: string): Promise<Card> {
    return cardFetch<Card>(`${CARDS_BASE}/${id}/`);
  },

  /**
   * POST /cards/
   * Requests a new card. Backend sets status to PENDING until issued.
   */
  createCard(payload: CreateCardPayload): Promise<Card> {
    return cardFetch<Card>(`${CARDS_BASE}/`, {
      method: "POST",
      body: payload,
    });
  },

  /**
   * PATCH /cards/{id}/
   * Updates cosmetic/preference fields only.
   */
  updateCard(id: string, payload: UpdateCardPayload): Promise<Card> {
    return cardFetch<Card>(`${CARDS_BASE}/${id}/`, {
      method: "PATCH",
      body: payload,
    });
  },

  /**
   * POST /cards/{id}/freeze/
   */
  freezeCard(id: string): Promise<Card> {
    return cardFetch<Card>(`${CARDS_BASE}/${id}/freeze/`, { method: "POST" });
  },

  /**
   * POST /cards/{id}/unfreeze/
   */
  unfreezeCard(id: string): Promise<Card> {
    return cardFetch<Card>(`${CARDS_BASE}/${id}/unfreeze/`, { method: "POST" });
  },

  /**
   * POST /cards/{id}/block/
   */
  blockCard(id: string): Promise<Card> {
    return cardFetch<Card>(`${CARDS_BASE}/${id}/block/`, { method: "POST" });
  },

  /**
   * POST /cards/{id}/set-default/
   */
  setDefaultCard(id: string): Promise<Card> {
    return cardFetch<Card>(`${CARDS_BASE}/${id}/set-default/`, { method: "POST" });
  },

  // ── Stats ──────────────────────────────────────────────────────────────────

  /**
   * GET /cards/stats/
   * Returns the aggregated stats row: total_limit, used_credit, available, cashback.
   */
  getCardStats(): Promise<CardStats> {
    return cardFetch<CardStats>(`${CARDS_BASE}/stats/`);
  },

  // ── Transactions ───────────────────────────────────────────────────────────

  /**
   * GET /cards/transactions/
   * Accepts the full TransactionFilters object; only defined values are sent.
   */
  getTransactions(filters: TransactionFilters = {}): Promise<PaginatedResponse<CardTransaction>> {
    return cardFetch<PaginatedResponse<CardTransaction>>(`${CARDS_BASE}/transactions/`, {
      params: buildFilterParams(filters),
    });
  },

  /**
   * GET /cards/transactions/{id}/
   */
  getTransaction(id: string): Promise<CardTransaction> {
    return cardFetch<CardTransaction>(`${CARDS_BASE}/transactions/${id}/`);
  },
};

export default CardService;

// ─── Named Exports (tree-shakeable) ───────────────────────────────────────────

export const {
  getCards,
  getCard,
  createCard,
  updateCard,
  freezeCard,
  unfreezeCard,
  blockCard,
  setDefaultCard,
  getCardStats,
  getTransactions,
  getTransaction,
} = CardService;