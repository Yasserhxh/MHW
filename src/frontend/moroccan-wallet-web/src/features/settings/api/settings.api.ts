import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockTask } from '@/shared/mocks/mockApi';
import type { UserPreferences } from '@/shared/mocks/appData';

type ProfilePayload = { fullName: string; email: string; language: string; timezone: string };
type PreferencePayload = Partial<Pick<UserPreferences, 'currency' | 'defaultWalletId' | 'salaryDay' | 'dashboardCompactMode' | 'householdDefaults'>>;
type NotificationSettingsPayload = Partial<UserPreferences['notifications']>;

export const settingsApi = {
  getProfile: () =>
    withMockTask(() => {
      const db = getMockDb();
      const user = db.users.find((item) => item.id === db.currentUserId)!;
      const onboarding = db.onboarding[db.currentUserId];
      return {
        fullName: user.fullName,
        email: user.email,
        language: onboarding.language,
        timezone: onboarding.timezone,
      };
    }, 150),
  saveProfile: (payload: ProfilePayload) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        users: db.users.map((user) => (user.id === db.currentUserId ? { ...user, fullName: payload.fullName, email: payload.email } : user)),
        onboarding: {
          ...db.onboarding,
          [db.currentUserId]: { ...db.onboarding[db.currentUserId], fullName: payload.fullName, language: payload.language, timezone: payload.timezone },
        },
      }));
      return true;
    }, 180),
  getPreferences: () =>
    withMockTask(() => {
      const db = getMockDb();
      return { ...db.preferences[db.currentUserId], ...db.onboarding[db.currentUserId] };
    }, 150),
  savePreferences: (payload: PreferencePayload) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        preferences: { ...db.preferences, [db.currentUserId]: { ...db.preferences[db.currentUserId], ...payload } },
        onboarding: { ...db.onboarding, [db.currentUserId]: { ...db.onboarding[db.currentUserId], currency: payload.currency ?? db.onboarding[db.currentUserId].currency, salaryDay: payload.salaryDay ?? db.onboarding[db.currentUserId].salaryDay } },
      }));
      return true;
    }, 180),
  saveNotificationSettings: (payload: NotificationSettingsPayload) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        preferences: {
          ...db.preferences,
          [db.currentUserId]: {
            ...db.preferences[db.currentUserId],
            notifications: { ...db.preferences[db.currentUserId].notifications, ...payload },
          },
        },
      }));
      return true;
    }, 180),
};
