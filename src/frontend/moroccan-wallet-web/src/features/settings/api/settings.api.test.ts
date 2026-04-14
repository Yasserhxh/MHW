import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, put } = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
    put,
  },
}));

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      email: 'amina@example.com',
    }),
  },
}));

import { settingsApi } from './settings.api';

describe('settingsApi', () => {
  beforeEach(() => {
    get.mockReset();
    put.mockReset();
  });

  it('maps backend preferences into the real frontend preference shape', async () => {
    get.mockResolvedValueOnce({
      data: {
        userId: 'user-1',
        locale: 'fr-MA',
        preferredCurrency: 'MAD',
        timezone: 'Africa/Casablanca',
        monthlyBudgetPreference: 7000,
        salaryDay: 28,
        householdMode: 'roommates',
      },
    });

    const response = await settingsApi.getPreferences();

    expect(response.data).toMatchObject({
      locale: 'fr-MA',
      currency: 'MAD',
      timezone: 'Africa/Casablanca',
      monthlyBudgetPreference: 7000,
      salaryDay: 28,
      householdMode: 'roommates',
    });
  });

  it('sends only backend-supported preference fields on save', async () => {
    put.mockResolvedValueOnce({ data: { message: 'ok' } });

    await settingsApi.savePreferences({
      locale: 'en',
      currency: 'EUR',
      timezone: 'Europe/Paris',
      monthlyBudgetPreference: 9000,
      salaryDay: 25,
      householdMode: 'family',
      defaultWalletId: 'wallet-main',
      dashboardCompactMode: true,
    });

    expect(put).toHaveBeenCalledWith('/users/preferences', {
      locale: 'en',
      preferredCurrency: 'EUR',
      timezone: 'Europe/Paris',
      monthlyBudgetPreference: 9000,
      salaryDay: 25,
      householdMode: 'family',
    });
  });
});
