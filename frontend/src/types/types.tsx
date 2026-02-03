export type PrivacyPolicySection = {
    title: string;
    content: string;
    items?: string[]
}

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
  email: string;
  username: string;
}
