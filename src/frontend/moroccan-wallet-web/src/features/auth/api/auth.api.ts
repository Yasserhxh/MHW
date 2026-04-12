import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';
import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockLatency, withMockTask } from '@/shared/mocks/mockApi';

function buildAuthResponse(email: string): LoginResponse {
  const db = getMockDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error('Account not found');
  }

  const onboarding = db.onboarding[user.id];
  return {
    accessToken: `mock-access-${user.id}`,
    refreshToken: `mock-refresh-${user.id}`,
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    onboardingCompleted: onboarding?.completed ?? false,
    emailVerified: user.emailVerified,
  };
}

export const authApi = {
  register: (payload: RegisterRequest) => {
    return withMockTask(() => {
      const db = getMockDb();
      const exists = db.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email already exists.');
      }
      if (payload.password !== payload.confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      if (!payload.acceptTerms) {
        throw new Error('You must accept the terms to continue.');
      }

      updateMockDb((current) => {
        const id = `user-${Date.now()}`;
        return {
          ...current,
          currentUserId: id,
          users: [
            ...current.users,
            {
              id,
              fullName: payload.fullName,
              email: payload.email,
              password: payload.password,
              emailVerified: false,
            },
          ],
          onboarding: {
            ...current.onboarding,
            [id]: {
              completed: false,
              fullName: payload.fullName,
              language: 'fr-MA',
              currency: 'MAD',
              timezone: 'Africa/Casablanca',
              householdMode: 'just-me',
            },
          },
          preferences: {
            ...current.preferences,
            [id]: {
              currency: 'MAD',
              defaultWalletId: 'wallet-main',
              dashboardCompactMode: false,
              householdDefaults: 'just-me',
              notifications: {
                reminderInApp: true,
                reminderEmail: true,
                sharedExpenseInApp: true,
                budgetWarningInApp: true,
                weeklyDigestEmail: false,
              },
            },
          },
        };
      });

      return { message: 'Registration successful. Please verify your email.' };
    }, 280);
  },

  login: (payload: LoginRequest) => {
    return withMockTask(() => {
      const db = getMockDb();
      const user = db.users.find((item) => item.email.toLowerCase() === payload.email.toLowerCase());
      if (!user || user.password !== payload.password) {
        throw new Error('Invalid email or password.');
      }

      return buildAuthResponse(payload.email);
    }, 220);
  },

  refresh: (refreshToken: string) => {
    const db = getMockDb();
    const userId = refreshToken.split('-').slice(-1)[0] || db.currentUserId;
    return withMockLatency({ accessToken: `mock-access-${userId}`, refreshToken }, 120);
  },

  forgotPassword: (payload: ForgotPasswordRequest) => {
    return withMockTask(() => {
      const db = getMockDb();
      const exists = db.users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());
      if (!exists) {
        throw new Error('No account was found for that email.');
      }
      return { message: 'Password reset instructions sent.', resetToken: 'mock-reset-token' };
    }, 180);
  },

  resetPassword: (payload: ResetPasswordRequest) => {
    return withMockTask(() => {
      if (!payload.token) {
        throw new Error('Reset token is missing.');
      }
      updateMockDb((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.id === current.currentUserId ? { ...user, password: payload.newPassword } : user
        ),
      }));
      return { message: 'Password updated successfully.' };
    }, 180);
  },

  verifyEmail: (payload: VerifyEmailRequest) => {
    return withMockTask(() => {
      if (!payload.token) {
        throw new Error('Verification token is missing.');
      }
      updateMockDb((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.id === current.currentUserId ? { ...user, emailVerified: true } : user
        ),
      }));
      return { message: 'Email verified successfully.' };
    }, 180);
  },

  logout: (refreshToken: string, accessToken?: string) => {
    void refreshToken;
    void accessToken;
    return withMockLatency({ message: 'Logged out.' }, 120);
  },

  logoutAll: () => {
    return withMockLatency({ message: 'All sessions cleared.' }, 120);
  },
};
