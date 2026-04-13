import { apiClient } from '@/shared/api/client';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  email: string;
};

type UserProfileResponse = {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  language: string;
  timezone: string;
  createdAt: string;
};

function buildFrontendAuthResponse(
  auth: BackendAuthResponse,
  profile?: Partial<UserProfileResponse> | null
): LoginResponse {
  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    userId: auth.userId,
    email: auth.email,
    fullName: profile?.displayName?.trim() || auth.email,
    onboardingCompleted: true,
    emailVerified: true,
  };
}

async function fetchProfileSafe() {
  try {
    const { data } = await apiClient.get<UserProfileResponse>('/users/profile');
    return data;
  } catch {
    return null;
  }
}

export const authApi = {
  register: async (payload: RegisterRequest) => {
    if (payload.password !== payload.confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (!payload.acceptTerms) {
      throw new Error('You must accept the terms to continue.');
    }

    return apiClient.post('/auth/register', {
      email: payload.email,
      password: payload.password,
    });
  },

  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<BackendAuthResponse>('/auth/login', payload);
    const profile = await fetchProfileSafe();
    return { data: buildFrontendAuthResponse(data, profile) };
  },

  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post<BackendAuthResponse>('/auth/refresh', { refreshToken });
    return {
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    };
  },

  forgotPassword: (payload: ForgotPasswordRequest) => {
    return apiClient.post('/auth/forgot-password', payload);
  },

  resetPassword: (payload: ResetPasswordRequest) => {
    return apiClient.post('/auth/reset-password', payload);
  },

  verifyEmail: (payload: VerifyEmailRequest) => {
    return apiClient.post('/auth/verify-email', payload);
  },

  logout: (refreshToken: string) => {
    return apiClient.post('/auth/logout', { refreshToken });
  },

  logoutAll: () => {
    return apiClient.post('/auth/logout-all');
  },
};
