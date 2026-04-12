import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockApiResponse, withMockMutation } from './onboarding.helpers';

export interface OnboardingPayload {
  fullName: string;
  language: string;
  currency: string;
  timezone: string;
  monthlyBudget?: number;
  salaryDay?: number;
  householdMode: 'just-me' | 'family' | 'roommates';
}

export const onboardingApi = {
  getProfile: () =>
    withMockApiResponse(() => {
      const db = getMockDb();
      return db.onboarding[db.currentUserId];
    }),
  saveProfile: (payload: OnboardingPayload) =>
    withMockMutation(() => {
      const next = updateMockDb((db) => ({
        ...db,
        onboarding: {
          ...db.onboarding,
          [db.currentUserId]: {
            ...db.onboarding[db.currentUserId],
            ...payload,
            completed: true,
          },
        },
        users: db.users.map((user) =>
          user.id === db.currentUserId ? { ...user, fullName: payload.fullName } : user
        ),
        preferences: {
          ...db.preferences,
          [db.currentUserId]: {
            ...db.preferences[db.currentUserId],
            currency: payload.currency,
            salaryDay: payload.salaryDay,
            householdDefaults: payload.householdMode,
          },
        },
      }));

      return next.onboarding[next.currentUserId];
    }),
};
