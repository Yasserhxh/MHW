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
  register: (payload: RegisterRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/register', payload);
    void payload;
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

  refresh: (refreshToken: string) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/refresh', { refreshToken });
    void refreshToken;
    return mockResponse({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
  },

  forgotPassword: (payload: ForgotPasswordRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/forgot-password', payload);
    void payload;
    return mockResponse({ message: 'Mock forgot-password email sent' });
  },

  resetPassword: (payload: ResetPasswordRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/reset-password', payload);
    void payload;
    return mockResponse({ message: 'Mock password reset success' });
  },

  verifyEmail: (payload: VerifyEmailRequest) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/verify-email', payload);
    void payload;
    return mockResponse({ message: 'Mock email verified' });
  },

  logout: (refreshToken: string, accessToken?: string) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/logout', { refreshToken });
    void refreshToken;
    void accessToken;
    return mockResponse({ message: 'Mock logout success' });
  },

  logoutAll: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/auth/logout-all');
    return mockResponse({ message: 'Mock logout all success' });
  },
};
