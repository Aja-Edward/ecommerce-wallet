/**
 * Wallet Type Definitions
 */

// ─── Core Types ────────────────────────────────────────────────────────────────

export type PaymentGateway = 'paystack' | 'flutterwave';
export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
export type TransactionSource = 'FUNDING' | 'ORDER_PAYMENT' | 'REFUND' | 'REVERSAL' | 'ADMIN_ADJUSTMENT';

export interface Wallet {
  user: number;
  email: string;
  username: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  wallet: number;
  user_email: string;
  transaction_type: TransactionType;
  amount: string;
  balance_before: string;
  balance_after: string;
  status: TransactionStatus;
  source: TransactionSource;
  reference: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SavedContact {
  username: string;
  display_name: string;
  initials: string;
  color: string;
  added_at: string;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface WalletBalanceResponse {
  balance: string;
  currency: string;
}

export interface TransactionListResponse {
  count: number;
  transactions: WalletTransaction[];
}

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
  payment_url: string;
  amount: string;
  payment_method: string;
  status: string;
}

export interface WalletTransferResponse {
  success: boolean;
  reference: string;
  recipient_name: string;
  amount: number;
  new_balance: string;
  message: string;
}

export interface WalletDebitResponse {
  message: string;
  transaction: WalletTransaction;
}

export interface WalletUserLookupResponse {
  id: number;
  username: string;
  email: string;
}

// ─── API Request Types ─────────────────────────────────────────────────────────

export interface WalletFundingRequest {
  amount: number;
  payment_method: PaymentGateway;
  transaction_type: 'WALLET_FUNDING';
}

export interface WalletTransferRequest {
  recipient_username: string;
  amount: number;
  description?: string;
}

export interface WalletDebitRequest {
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

// ─── State Types ───────────────────────────────────────────────────────────────

export interface FundingForm {
  amount: string;
  gateway: PaymentGateway;
  isLoading: boolean;
}

export interface WalletState {
  wallet: Wallet | null;
  balance: string;
  transactions: WalletTransaction[];
  transactionCount: number;
  currentTransaction: WalletTransaction | null;
  isLoading: boolean;
  error: string | null;
  fundingForm: FundingForm;
  contacts: SavedContact[];
}

// ─── Context Type ──────────────────────────────────────────────────────────────

export interface WalletContextType extends WalletState {
  // Data fetching
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
  fetchTransactionByReference: (reference: string) => Promise<void>;
  refreshWallet: () => Promise<void>;

  // Funding
  initiateFunding: (request: WalletFundingRequest) => Promise<WalletFundingResponse>;
  setFundingAmount: (amount: string) => void;
  setFundingGateway: (gateway: PaymentGateway) => void;
  submitFunding: () => Promise<void>;

  // Transfer
  submitTransfer: (request: WalletTransferRequest) => Promise<WalletTransferResponse>;
  lookupUser: (username: string) => Promise<WalletUserLookupResponse>;

  // Contact management
  loadContacts: () => void;
  addContact: (contact: Omit<SavedContact, 'added_at'>) => void;
  removeContact: (username: string) => void;

  // Error handling
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