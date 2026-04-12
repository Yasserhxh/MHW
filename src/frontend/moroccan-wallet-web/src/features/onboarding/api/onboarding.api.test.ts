import { describe, expect, it } from 'vitest';
import { onboardingApi } from './onboarding.api';
import { getMockDb } from '@/shared/mocks/mockDb';

describe('onboardingApi', () => {
  it('returns the seeded onboarding profile', async () => {
    const response = await onboardingApi.getProfile();

    expect(response.data?.fullName).toBe('Amina El Idrissi');
    expect(response.data?.currency).toBe('MAD');
    expect(response.data?.completed).toBe(true);
  });

  it('saves onboarding answers and updates user preferences', async () => {
    const response = await onboardingApi.saveProfile({
      fullName: 'Amina Updated',
      language: 'en',
      currency: 'EUR',
      timezone: 'Africa/Casablanca',
      monthlyBudget: 9000,
      salaryDay: 25,
      householdMode: 'family',
    });

    const db = getMockDb();

    expect(response.data.fullName).toBe('Amina Updated');
    expect(response.data.completed).toBe(true);
    expect(db.users.find((user) => user.id === db.currentUserId)?.fullName).toBe('Amina Updated');
    expect(db.preferences[db.currentUserId]).toMatchObject({
      currency: 'EUR',
      salaryDay: 25,
      householdDefaults: 'family',
    });
  });
});
