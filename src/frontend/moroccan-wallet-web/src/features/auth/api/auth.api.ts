import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

const MOCK_LATENCY_MS = 250;

function mockResponse<T>(data: T): Promise<{ data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), MOCK_LATENCY_MS);
  });
}

export const authApi = {
  register: (_payload: RegisterRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/register', payload);
    return mockResponse({ message: 'Mock register success' });
  },

  login: (payload: LoginRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post<LoginResponse>('/auth/login', payload);
    return mockResponse<LoginResponse>({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: payload.email,
      },
    });
  },

  refresh: (_refreshToken: string) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/refresh', { refreshToken });
    return mockResponse({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
  },

  forgotPassword: (_payload: ForgotPasswordRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/forgot-password', payload);
    return mockResponse({ message: 'Mock forgot-password email sent' });
  },

  resetPassword: (_payload: ResetPasswordRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/reset-password', payload);
    return mockResponse({ message: 'Mock password reset success' });
  },

  verifyEmail: (_payload: VerifyEmailRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/verify-email', payload);
    return mockResponse({ message: 'Mock email verified' });
  },

  logout: (_refreshToken: string, _accessToken?: string) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/logout', { refreshToken: _refreshToken });
    return mockResponse({ message: 'Mock logout success' });
  },

  logoutAll: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/logout-all');
    return mockResponse({ message: 'Mock logout all success' });
  },
};
