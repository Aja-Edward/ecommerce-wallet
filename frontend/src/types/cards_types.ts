export type CardType     = "VISA" | "MASTERCARD" | "VERVE";
export type CardCategory = "VIRTUAL" | "PHYSICAL";
export type CardStatus   = "ACTIVE" | "FROZEN" | "BLOCKED" | "EXPIRED" | "PENDING";

export interface Card {
  id: string;
  card_type: CardType;
  card_category: CardCategory;
  last_four: string;
  holder_name: string;
  expiry_month: number;
  expiry_year: number;
  expiry_display: string;       // "MM/YY" — computed by backend
  balance: number;
  credit_limit: number;
  available_credit: number;     // computed by backend
  cashback_balance: number;
  color_gradient: string;       // e.g. "from-blue-600 to-blue-800"
  accent_color: string;         // e.g. "#3b82f6"
  status: CardStatus;
  is_default: boolean;
  is_expired: boolean;
  created_at: string;
}

export type TransactionCategory =
  | "SHOPPING"
  | "FOOD_DINING"
  | "ENTERTAINMENT"
  | "UTILITIES"
  | "TRAVEL"
  | "HEALTH"
  | "INCOME"
  | "TRANSFER"
  | "OTHER";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";

export interface CardTransaction {
  id: string;
  card: string;                 // card UUID
  card_last_four: string;
  merchant: string;
  category: TransactionCategory;
  merchant_icon: string;
  amount: number;               // positive = credit, negative = debit
  currency: string;
  balance_before: number;
  balance_after: number;
  status: TransactionStatus;
  reference: string;
  description: string | null;
  is_credit: boolean;
  created_at: string;
}

export interface CardStats {
  total_limit: number;
  used_credit: number;
  available: number;
  cashback: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Request / Response shapes ─────────────────────────────────────────────────

export interface CreateCardPayload {
  card_type: CardType;
  card_category: CardCategory;
  holder_name: string;
  color_gradient?: string;
  accent_color?: string;
}

export interface UpdateCardPayload {
  holder_name?: string;
  color_gradient?: string;
  accent_color?: string;
  is_default?: boolean;
}

export interface TransactionFilters {
  card?: string;                // card UUID
  card_last_four?: string;      // powers the "All Cards / **** XXXX" dropdown
  category?: TransactionCategory;
  status?: TransactionStatus;
  transaction_direction?: "credit" | "debit";
  min_amount?: number;
  max_amount?: number;
  from_date?: string;           // ISO datetime string
  to_date?: string;
  search?: string;
  ordering?: string;
  page?: number;
}