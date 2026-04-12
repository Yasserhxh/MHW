import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { accessToken: string; refreshToken: string; userId: string; email: string }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      isAuthenticated: false,
      setAuth: ({ accessToken, refreshToken, userId, email }) => set({ accessToken, refreshToken, userId, email, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, userId: null, email: null, isAuthenticated: false }),
    }),
    {
      name: 'mhw-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        userId: s.userId,
        email: s.email,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export const useAuthStore = authStore;
