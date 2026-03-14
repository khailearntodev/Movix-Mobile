export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  is_verified?: boolean; 
  status?: string;
  xp?: number;
  total_watch_time?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  id: string;
  username: string;
  email: string;
  role?: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password?: string;
  display_name?: string;
}

export interface VerifyPayload {
  email: string;
  verificationCode: string; 
}

export interface ResendVerificationPayload {
  email: string;
}
