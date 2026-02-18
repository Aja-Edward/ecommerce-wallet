/**
 * Wallet Service
 * API service layer for all wallet-related operations
 */

import type {
  Wallet,
  WalletTransaction,
  TransactionListResponse,
  WalletBalanceResponse,
  WalletFundingRequest,
  WalletFundingResponse,
  WalletDebitRequest,
  WalletDebitResponse,
} from '../types/wallet.types';

import type { ApiError } from '../types/api.types';

// ─── Base Configuration ────────────────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const WALLET_BASE = `${API_BASE_URL}/wallet`;

// ─── Token Helper ──────────────────────────────────────────────────────────────

/**
 * Retrieve the stored access token.
 * Adjust the key name to match wherever your auth service persists it.
 */
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// ─── Fetch Wrapper ─────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean>;
}

async function walletFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options;

  const token = getAccessToken();
  if (!token) {
    throw { error: 'Unauthenticated: no access token found.', status: 401 } as ApiError;
  }

  // Build URL with optional query params
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

  // Parse JSON regardless of ok status so we can surface the error message
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

// ─── Wallet Service ────────────────────────────────────────────────────────────

const WalletService = {
  /**
   * GET /wallet/
   * Retrieve the authenticated user's wallet details and balance.
   */
  getWallet(): Promise<Wallet> {
    return walletFetch<Wallet>(`${WALLET_BASE}/`);
  },

  /**
   * GET /wallet/balance/
   * Quick endpoint to fetch only the current balance.
   */
  getBalance(): Promise<WalletBalanceResponse> {
    return walletFetch<WalletBalanceResponse>(`${WALLET_BASE}/balance/`);
  },

  /**
   * GET /wallet/transactions/
   * Retrieve the user's full transaction history.
   * @param limit  Optional cap on the number of transactions returned.
   */
  getTransactions(limit?: number): Promise<TransactionListResponse> {
    const params: Record<string, number> = {};
    if (limit !== undefined) params.limit = limit;

    return walletFetch<TransactionListResponse>(`${WALLET_BASE}/transactions/`, {
      params,
    });
  },

  /**
   * GET /wallet/transactions/:reference/
   * Retrieve a single transaction by its unique reference string.
   */
  getTransactionByReference(reference: string): Promise<WalletTransaction> {
    return walletFetch<WalletTransaction>(
      `${WALLET_BASE}/transactions/${encodeURIComponent(reference)}/`
    );
  },

  /**
   * POST /wallet/fund/
   * Initiate a wallet funding request via a payment gateway.
   * Returns a pending transaction reference; the caller must complete
   * the payment externally (Paystack / Flutterwave redirect).
   */
  initiateFunding(request: WalletFundingRequest): Promise<WalletFundingResponse> {
    return walletFetch<WalletFundingResponse>(`${WALLET_BASE}/fund/`, {
      method: 'POST',
      body: request,
    });
  },

  /**
   * POST /wallet/debit/
   * Internal endpoint — debit the wallet (used by order/checkout flows).
   * Not intended to be called directly from user-facing UI.
   */
  debitWallet(request: WalletDebitRequest): Promise<WalletDebitResponse> {
    return walletFetch<WalletDebitResponse>(`${WALLET_BASE}/debit/`, {
      method: 'POST',
      body: request,
    });
  },
};

export default WalletService;

// ─── Named Exports (tree-shakeable) ───────────────────────────────────────────

export const {
  getWallet,
  getBalance,
  getTransactions,
  getTransactionByReference,
  initiateFunding,
  debitWallet,
} = WalletService;