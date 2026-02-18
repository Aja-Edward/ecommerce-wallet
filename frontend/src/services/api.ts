// services/api.ts
import type {RegisterPayload, LoginPayload, AuthTokens, UserProfile} from '../types/auth.types';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Token helpers ────────────────────────────────────────────────────────────
// Centralised so the rest of the app (e.g. a Zustand store or context)
// can call these after login / on app boot.

export function setTokens(tokens: AuthTokens): void {
  sessionStorage.setItem("access_token", tokens.access_token);
  sessionStorage.setItem("refresh_token", tokens.refresh_token);
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem("access_token");
}

export function clearTokens(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
}

// ─── Base request ─────────────────────────────────────────────────────────────
// Handles JSON serialisation, status checks, and attaches the Bearer token
// automatically when one exists in the session.

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {  // ← FIXED: Added parentheses
    ...options,
    headers,
  });

  // Parse body once — works for both success and error payloads
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Surface the backend's error message if it exists, otherwise fall back
    const message =
      data?.error || data?.detail || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

/**
 * Register a new user.
 * On success the backend returns a simple confirmation — no tokens yet.
 * The caller should then call `login` immediately if auto-login is desired.
 */
export async function register(
  payload: RegisterPayload
): Promise<{ message: string }> {
  return request<{ message: string }>("/api/auth/register/", {  // ← FIXED: Added leading slash
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Log in and persist the returned tokens to sessionStorage.
 */
export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const tokens = await request<AuthTokens>("/api/auth/login/", {  // ← FIXED: Added leading slash
    method: "POST",
    body: JSON.stringify(payload),
  });
  setTokens(tokens); // store so subsequent requests carry the Bearer header
  return tokens;
}

/**
 * Fetch the authenticated user's profile.
 * Requires a valid access_token already stored (i.e. login was called first).
 */
export async function getProfile(): Promise<UserProfile> {
  return request<UserProfile>("/api/auth/profile/");  // ← FIXED: Added leading slash
}

/**
 * Log out by clearing stored tokens client-side.
 * If your backend ever adds a logout endpoint (e.g. to revoke refresh tokens),
 * add a POST call here before clearing.
 */
export function logout(): void {
  clearTokens();
}