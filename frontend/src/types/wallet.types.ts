/**
 * Wallet Types
 * Types for wallet balance, transactions, and operations
 */

// ─── Transaction Enums ────────────────────────────────────────────────────────

export type TransactionType   = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
export type TransactionSource =
  | 'FUNDING'
  | 'ORDER_PAYMENT'
  | 'REFUND'
  | 'REVERSAL'
  | 'ADMIN_ADJUSTMENT';

/** Supported payment gateways */
export type PaymentGateway = 'paystack' | 'flutterwave';

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface Wallet {
  user: number;
  email: string;
  username: string;
  balance: string;        // Decimal as string to maintain precision
  created_at: string;     // ISO 8601
  updated_at: string;     // ISO 8601
}

export interface WalletTransaction {
  id: number;
  wallet: number;
  user_email: string;
  transaction_type: TransactionType;
  amount: string;         // Decimal as string
  balance_before: string;
  balance_after: string;
  status: TransactionStatus;
  source: TransactionSource;
  reference: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;     // ISO 8601
  updated_at: string;     // ISO 8601
}

// ─── API Request / Response Shapes ───────────────────────────────────────────

export interface TransactionListResponse {
  count: number;
  transactions: WalletTransaction[];
}

export interface WalletBalanceResponse {
  balance: string;
  currency: string;
}

/**
 * Matches the body your backend /api/payment/initiate/ expects.
 * Uses `gateway` and `transaction_type` to match the actual API.
 */
export interface WalletFundingRequest {
  amount: number;
  payment_method: PaymentGateway;
  transaction_type: 'WALLET_FUNDING';
}

/**
 * Matches the actual 201 response from /api/payment/initiate/
 * { "message": "...", "payment": { "payment_url": "...", ... } }
 */
export interface PaymentDetail {
  id: string;
  payment_method: string;
  transaction_type: string;
  amount: string;
  currency: string;
  reference: string;
  gateway_reference: string | null;
  status: TransactionStatus;
  payment_url: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  webhook_received: boolean;
}

export interface WalletFundingResponse {
  message: string;
  transaction_reference: string;
  payment_url: string;             // ← flat, not nested under "payment"
  amount: string;
  payment_method: string;
  status: string;
}

export interface WalletDebitRequest {
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletDebitResponse {
  message: string;
  transaction: WalletTransaction;
}

// ─── Funding Form ─────────────────────────────────────────────────────────────

export interface FundingForm {
  amount: string;
  gateway: PaymentGateway;
  isLoading: boolean;
}

// ─── Context State ────────────────────────────────────────────────────────────

export interface WalletState {
  wallet: Wallet | null;
  balance: string;
  transactions: WalletTransaction[];
  transactionCount: number;
  currentTransaction: WalletTransaction | null;
  isLoading: boolean;
  error: string | null;
  fundingForm: FundingForm;
}

export interface WalletContextType extends WalletState {
  // Data fetching
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
  fetchTransactionByReference: (reference: string) => Promise<void>;
  refreshWallet: () => Promise<void>;

  // Funding form — managed entirely in context, no local state needed in components
  setFundingAmount: (amount: string) => void;
  setFundingGateway: (gateway: PaymentGateway) => void;
  submitFunding: () => Promise<void>;

  // Programmatic funding (for use outside the standard form flow)
  initiateFunding: (request: WalletFundingRequest) => Promise<WalletFundingResponse>;

  clearError: () => void;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  source?: TransactionSource;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// ─── Parsed Transaction (UI layer) ───────────────────────────────────────────

export interface ParsedTransaction extends WalletTransaction {
  amountNumber: number;
  balanceBeforeNumber: number;
  balanceAfterNumber: number;
  createdAtDate: Date;
  updatedAtDate: Date;
  isCredit: boolean;
  isDebit: boolean;
  isPending: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isReversed: boolean;
}