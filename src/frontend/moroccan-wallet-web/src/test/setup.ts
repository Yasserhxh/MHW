import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { authStore } from '@/features/auth/store/auth.store';
import { resetMockDb } from '@/shared/mocks/mockDb';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

beforeEach(() => {
  window.localStorage.clear();
  resetMockDb();
  authStore.getState().clearAuth();
});

afterEach(() => {
  cleanup();
});
