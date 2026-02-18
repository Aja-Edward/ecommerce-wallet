/**
 * Type Utility Functions
 * Helper functions for transforming and parsing typed data
 */

import type {
  WalletTransaction,
  ParsedTransaction,
  TransactionType,
  TransactionStatus,
} from './wallet.types';

/**
 * Parse decimal string to number
 */
export const parseDecimal = (value: string): number => {
  return parseFloat(value) || 0;
};

/**
 * Format currency for display
 */
export const formatCurrency = (
  amount: string | number,
  currency: string = 'NGN',
  locale: string = 'en-NG'
): string => {
  const numericAmount = typeof amount === 'string' ? parseDecimal(amount) : amount;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Format currency without symbol (just number with commas)
 */
export const formatAmount = (amount: string | number): string => {
  const numericAmount = typeof amount === 'string' ? parseDecimal(amount) : amount;
  
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Parse ISO date string to Date object
 */
export const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Format date for display
 */
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = parseISODate(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat('en-NG', options || defaultOptions).format(date);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = parseISODate(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Parse WalletTransaction to ParsedTransaction with computed properties
 */
export const parseTransaction = (transaction: WalletTransaction): ParsedTransaction => {
  return {
    ...transaction,
    amountNumber: parseDecimal(transaction.amount),
    balanceBeforeNumber: parseDecimal(transaction.balance_before),
    balanceAfterNumber: parseDecimal(transaction.balance_after),
    createdAtDate: parseISODate(transaction.created_at),
    updatedAtDate: parseISODate(transaction.updated_at),
    isCredit: transaction.transaction_type === 'CREDIT',
    isDebit: transaction.transaction_type === 'DEBIT',
    isPending: transaction.status === 'PENDING',
    isCompleted: transaction.status === 'COMPLETED',
    isFailed: transaction.status === 'FAILED',
    isReversed: transaction.status === 'REVERSED',
  };
};

/**
 * Get transaction type color
 */
export const getTransactionTypeColor = (type: TransactionType): string => {
  return type === 'CREDIT' ? 'green' : 'red';
};

/**
 * Get transaction status color
 */
export const getTransactionStatusColor = (status: TransactionStatus): string => {
  const colors: Record<TransactionStatus, string> = {
    PENDING: 'yellow',
    COMPLETED: 'green',
    FAILED: 'red',
    REVERSED: 'gray',
  };
  
  return colors[status] || 'gray';
};

/**
 * Get transaction type icon
 */
export const getTransactionTypeIcon = (type: TransactionType): string => {
  return type === 'CREDIT' ? '↓' : '↑';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Truncate reference (e.g., "TXN-A1B2C3D4E5F6" -> "TXN-A1B2...E5F6")
 */
export const truncateReference = (reference: string): string => {
  if (reference.length <= 16) return reference;
  return `${reference.substring(0, 10)}...${reference.substring(reference.length - 4)}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate amount (must be positive number)
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0;
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Group transactions by date
 */
export const groupTransactionsByDate = (
  transactions: WalletTransaction[]
): Record<string, WalletTransaction[]> => {
  return transactions.reduce((groups, transaction) => {
    const date = formatDate(transaction.created_at, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, WalletTransaction[]>);
};

/**
 * Calculate total from transactions
 */
export const calculateTransactionTotal = (
  transactions: WalletTransaction[],
  type?: TransactionType
): number => {
  return transactions
    .filter((t) => !type || t.transaction_type === type)
    .reduce((sum, t) => sum + parseDecimal(t.amount), 0);
};

/**
 * Safe JSON parse
 */
export const safeJSONParse = <T = any>(
  jsonString: string,
  fallback: T
): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};