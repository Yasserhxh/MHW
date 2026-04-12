import { describe, expect, it } from 'vitest';
import { settingsApi } from './settings.api';
import { getMockDb } from '@/shared/mocks/mockDb';

describe('settingsApi', () => {
  it('returns profile and preference data for the current user', async () => {
    const profile = await settingsApi.getProfile();
    const preferences = await settingsApi.getPreferences();

    expect(profile.data.fullName).toBe('Amina El Idrissi');
    expect(preferences.data.currency).toBe('MAD');
    expect(preferences.data.householdMode).toBe('roommates');
  });

  it('saves profile, preferences, and notification settings', async () => {
    await settingsApi.saveProfile({
      fullName: 'Amina Profile',
      email: 'amina.profile@example.com',
      language: 'en',
      timezone: 'Africa/Casablanca',
    });

    await settingsApi.savePreferences({
      currency: 'EUR',
      defaultWalletId: 'wallet-cash',
      salaryDay: 26,
      dashboardCompactMode: true,
      householdDefaults: 'family',
    });

    await settingsApi.saveNotificationSettings({
      weeklyDigestEmail: true,
      reminderInApp: false,
    });

    const db = getMockDb();
    const user = db.users.find((item) => item.id === db.currentUserId);
    const prefs = db.preferences[db.currentUserId];

    expect(user?.fullName).toBe('Amina Profile');
    expect(user?.email).toBe('amina.profile@example.com');
    expect(prefs.currency).toBe('EUR');
    expect(prefs.defaultWalletId).toBe('wallet-cash');
    expect(prefs.notifications.weeklyDigestEmail).toBe(true);
    expect(prefs.notifications.reminderInApp).toBe(false);
  });
});
