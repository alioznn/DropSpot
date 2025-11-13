export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: number;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: AuthToken;
  user: AuthUser;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

