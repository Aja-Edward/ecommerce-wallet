/**
 * Common Types
 * Shared utility types used across the application
 */

/**
 * Privacy Policy Section (from your existing types)
 */
export type PrivacyPolicySection = {
  title: string;
  content: string;
  items?: string[];
}

/**
 * Loading State
 */
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

/**
 * Error State
 */
export interface ErrorState {
  error: string | null;
  errorDetails?: Record<string, any>;
}

/**
 * Async State (combines loading and error)
 */
export interface AsyncState extends LoadingState, ErrorState {
  status: 'idle' | 'loading' | 'success' | 'error';
}

/**
 * Modal State
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

/**
 * Pagination State
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Sort Order
 */
export type SortOrder = 'asc' | 'desc';

export interface SortState {
  field: string;
  order: SortOrder;
}

/**
 * Date Range
 */
export interface DateRange {
  startDate: string | Date;
  endDate: string | Date;
}

/**
 * Currency Format
 */
export interface CurrencyFormat {
  code: string; // 'NGN', 'USD', etc.
  symbol: string; // '₦', '$', etc.
  locale: string; // 'en-NG', 'en-US', etc.
}

/**
 * Form Field Props
 */
export interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

/**
 * Button Variant
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Theme
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Route Config
 */
export interface RouteConfig {
  path: string;
  name: string;
  component: React.ComponentType;
  isProtected: boolean;
  allowedRoles?: string[];
}

/**
 * Select Option (for dropdowns)
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Table Column Definition
 */
export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor: (row: T) => any;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Breadcrumb Item
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

/**
 * Stats Card Data
 */
export interface StatsCard {
  title: string;
  value: string | number;
  change?: number; // percentage change
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
}

/**
 * Chart Data Point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Time Period
 */
export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all';

/**
 * Filter Option
 */
export interface FilterOption {
  id: string;
  label: string;
  value: any;
  checked: boolean;
}