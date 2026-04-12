import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  isAuthenticated: boolean;
  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    fullName: string;
    onboardingCompleted: boolean;
    emailVerified: boolean;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setProfile: (payload: { fullName?: string; email?: string; onboardingCompleted?: boolean; emailVerified?: boolean }) => void;
  clearAuth: () => void;
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      fullName: null,
      onboardingCompleted: false,
      emailVerified: false,
      isAuthenticated: false,
      setAuth: ({ accessToken, refreshToken, userId, email, fullName, onboardingCompleted, emailVerified }) =>
        set({ accessToken, refreshToken, userId, email, fullName, onboardingCompleted, emailVerified, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, isAuthenticated: true }),
      setProfile: ({ fullName, email, onboardingCompleted, emailVerified }) =>
        set((state) => ({
          fullName: fullName ?? state.fullName,
          email: email ?? state.email,
          onboardingCompleted: onboardingCompleted ?? state.onboardingCompleted,
          emailVerified: emailVerified ?? state.emailVerified,
        })),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          email: null,
          fullName: null,
          onboardingCompleted: false,
          emailVerified: false,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'mhw-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        userId: s.userId,
        email: s.email,
        fullName: s.fullName,
        onboardingCompleted: s.onboardingCompleted,
        emailVerified: s.emailVerified,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export const useAuthStore = authStore;
