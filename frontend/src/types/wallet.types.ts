/**
 * Wallet Types
 * Types for wallet balance, transactions, and operations
 */

/**
 * Transaction Types
 */
export type TransactionType = 'CREDIT' | 'DEBIT';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export type TransactionSource = 
  | 'FUNDING' 
  | 'ORDER_PAYMENT' 
  | 'REFUND' 
  | 'REVERSAL' 
  | 'ADMIN_ADJUSTMENT';

/**
 * Wallet Interface
 */
export interface Wallet {
  user: number;
  email: string;
  username: string;
  balance: string; // Decimal as string to maintain precision
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Wallet Transaction Interface
 */
export interface WalletTransaction {
  id: number;
  wallet: number;
  user_email: string;
  transaction_type: TransactionType;
  amount: string; // Decimal as string
  balance_before: string; // Decimal as string
  balance_after: string; // Decimal as string
  status: TransactionStatus;
  source: TransactionSource;
  reference: string; // Unique transaction reference
  description: string | null;
  metadata: Record<string, any>; // JSON metadata
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Transaction List Response
 */
export interface TransactionListResponse {
  count: number;
  transactions: WalletTransaction[];
}

/**
 * Wallet Balance Response
 */
export interface WalletBalanceResponse {
  balance: string;
  currency: string;
}

/**
 * Wallet Funding Request
 */
export interface WalletFundingRequest {
  amount: number;
  payment_method: 'paystack' | 'flutterwave';
}

/**
 * Wallet Funding Response
 */
export interface WalletFundingResponse {
  message: string;
  transaction_reference: string;
  amount: string;
  payment_method: string;
  status: TransactionStatus;
  next_step: string;
}

/**
 * Wallet Debit Request (Internal)
 */
export interface WalletDebitRequest {
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Wallet Debit Response
 */
export interface WalletDebitResponse {
  message: string;
  transaction: WalletTransaction;
}

/**
 * Wallet State (for Context/Redux)
 */
export interface WalletState {
  wallet: Wallet | null;
  balance: string;
  transactions: WalletTransaction[];
  transactionCount: number;
  currentTransaction: WalletTransaction | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Wallet Context Type
 */
export interface WalletContextType extends WalletState {
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
  fetchTransactionByReference: (reference: string) => Promise<void>;
  initiateFunding: (request: WalletFundingRequest) => Promise<WalletFundingResponse>;
  refreshWallet: () => Promise<void>;
  clearError: () => void;
}

/**
 * Transaction Filter Options
 */
export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  source?: TransactionSource;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Parsed Transaction (for UI display)
 */
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