import { apiClient } from '../../../shared/api/client';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

export const authApi = {
  register: (payload: RegisterRequest) => apiClient.post('/auth/register', payload),
  login: (payload: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', payload),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  forgotPassword: (payload: ForgotPasswordRequest) => apiClient.post('/auth/forgot-password', payload),
  resetPassword: (payload: ResetPasswordRequest) => apiClient.post('/auth/reset-password', payload),
  verifyEmail: (payload: VerifyEmailRequest) => apiClient.post('/auth/verify-email', payload),
  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
  logoutAll: () => apiClient.post('/auth/logout-all'),
};
