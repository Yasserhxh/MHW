import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type {
  NotificationSettingsValues,
  PreferenceSettingsValues,
  ProfileSettingsValues,
} from '../types/settings.types';

type ProfileResponse = {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  language: string;
  timezone: string;
  createdAt: string;
};

type PreferencesResponse = {
  userId: string;
  locale: string;
  preferredCurrency: string;
  timezone: string;
  monthlyBudgetPreference?: number | null;
  salaryDay?: number | null;
  householdMode: string;
};

const notificationPreferenceKey = 'mhw-notification-preferences';

const defaultNotificationPreferences: Required<NotificationSettingsValues> = {
  reminderInApp: true,
  reminderEmail: true,
  sharedExpenseInApp: true,
  budgetWarningInApp: true,
  weeklyDigestEmail: false,
};

function readNotificationPreferences() {
  if (typeof window === 'undefined') {
    return defaultNotificationPreferences;
  }

  try {
    const raw = window.localStorage.getItem(notificationPreferenceKey);
    if (!raw) {
      return defaultNotificationPreferences;
    }

    return {
      ...defaultNotificationPreferences,
      ...JSON.parse(raw),
    };
  } catch {
    return defaultNotificationPreferences;
  }
}

function writeNotificationPreferences(payload: NotificationSettingsValues) {
  const next = {
    ...readNotificationPreferences(),
    ...payload,
  };
  window.localStorage.setItem(notificationPreferenceKey, JSON.stringify(next));
  return next;
}

export const settingsApi = {
  getProfile: async () => {
    const { data } = await apiClient.get<ProfileResponse>('/users/profile');
    const auth = useAuthStore.getState();
    return {
      data: {
        fullName: data.displayName,
        email: auth.email ?? '',
        language: data.language,
        timezone: data.timezone,
      } satisfies ProfileSettingsValues,
    };
  },

  saveProfile: async (payload: ProfileSettingsValues) => {
    const { data } = await apiClient.put('/users/profile', {
      displayName: payload.fullName,
      avatarUrl: null,
      language: payload.language,
      timezone: payload.timezone,
    });
    return { data };
  },

  getPreferences: async () => {
    const { data } = await apiClient.get<PreferencesResponse>('/users/preferences');
    return {
      data: {
        locale: data.locale,
        currency: data.preferredCurrency,
        timezone: data.timezone,
        monthlyBudgetPreference: data.monthlyBudgetPreference ?? null,
        defaultWalletId: '',
        salaryDay: data.salaryDay ?? null,
        dashboardCompactMode: false,
        householdMode: data.householdMode,
        notifications: readNotificationPreferences(),
      } satisfies PreferenceSettingsValues,
    };
  },

  savePreferences: async (payload: PreferenceSettingsValues) => {
    const { data } = await apiClient.put('/users/preferences', {
      locale: payload.locale,
      preferredCurrency: payload.currency,
      timezone: payload.timezone,
      monthlyBudgetPreference: payload.monthlyBudgetPreference ?? null,
      salaryDay: payload.salaryDay ?? null,
      householdMode: payload.householdMode,
    });
    return { data };
  },

  saveNotificationSettings: async (payload: NotificationSettingsValues) => {
    return { data: writeNotificationPreferences(payload) };
  },
};
