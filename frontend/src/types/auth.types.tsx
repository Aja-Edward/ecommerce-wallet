/**
 * Authentication Types
 * Types for user authentication, registration, and profile management
 */

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: {
    email: string;
  };
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  date_of_birth?: string;
  bio?: string;
  address?: UserAddress;
  is_active: boolean;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  date_joined: string;
  last_login?: string;
  preferences?: UserPreferences;
}

export interface UserAddress {
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface UserPreferences {
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  newsletter_subscribed: boolean;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: UpdateProfilePayload) => Promise<void>;
  updatePassword: (payload: UpdatePasswordPayload) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  clearError: () => void;
}

/**
 * Profile Update Payloads
 */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  date_of_birth?: string;
  bio?: string;
  address?: UserAddress;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdatePreferencesPayload {
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  newsletter_subscribed?: boolean;
  currency?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
}