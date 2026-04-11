import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;

  setAuth: (accessToken: string, refreshToken: string, userId: string, email: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, userId, email) =>
        set({ accessToken, refreshToken, userId, email, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          email: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'mw-auth',
      // Only persist refreshToken and userId (not accessToken — kept in memory)
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        userId: state.userId,
        email: state.email,
      }),
    }
  )
);
