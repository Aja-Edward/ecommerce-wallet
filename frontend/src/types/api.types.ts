/**
 * API Response Types
 * Standard response and error types for API calls
 */

/**
 * Standard API Response
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>; // DRF validation errors
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  detail?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * API Request Config
 */
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API Status
 */
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Form Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Toast/Notification Type
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}