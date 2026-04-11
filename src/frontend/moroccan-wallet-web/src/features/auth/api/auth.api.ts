import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const AUTH_URL = `${BASE_URL}/api/v1/auth`;

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  email: string;
}

// Use plain axios (no interceptors) for auth endpoints to avoid circular refresh
const authAxios = axios.create({ baseURL: AUTH_URL });

export const authApi = {
  register: (data: RegisterRequest) =>
    authAxios.post('/register', data),

  verifyEmail: (token: string) =>
    authAxios.post('/verify-email', { token }),

  login: (data: LoginRequest) =>
    authAxios.post<AuthResponse>('/login', data),

  refresh: (refreshToken: string) =>
    authAxios.post<AuthResponse>('/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    authAxios.post('/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    authAxios.post('/reset-password', { token, newPassword }),

  logout: (refreshToken: string, accessToken: string) =>
    authAxios.post('/logout', { refreshToken }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
