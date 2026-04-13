import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/store/auth.store';

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

type ProfilePayload = { fullName: string; email: string; language: string; timezone: string };
type PreferencePayload = {
  currency?: string;
  defaultWalletId?: string;
  salaryDay?: number;
  dashboardCompactMode?: boolean;
  householdDefaults?: string;
};
type NotificationSettingsPayload = {
  reminderInApp?: boolean;
  reminderEmail?: boolean;
  sharedExpenseInApp?: boolean;
  budgetWarningInApp?: boolean;
  weeklyDigestEmail?: boolean;
};

const notificationPreferenceKey = 'mhw-notification-preferences';

const defaultNotificationPreferences: Required<NotificationSettingsPayload> = {
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

function writeNotificationPreferences(payload: NotificationSettingsPayload) {
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
      },
    };
  },

  saveProfile: async (payload: ProfilePayload) => {
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
        currency: data.preferredCurrency,
        defaultWalletId: '',
        salaryDay: data.salaryDay ?? 28,
        dashboardCompactMode: false,
        householdDefaults: data.householdMode,
        notifications: readNotificationPreferences(),
      },
    };
  },

  savePreferences: async (payload: PreferencePayload) => {
    const current = await apiClient.get<PreferencesResponse>('/users/preferences');
    const { data } = await apiClient.put('/users/preferences', {
      locale: current.data.locale,
      preferredCurrency: payload.currency ?? current.data.preferredCurrency,
      timezone: current.data.timezone,
      monthlyBudgetPreference: current.data.monthlyBudgetPreference ?? null,
      salaryDay: payload.salaryDay ?? current.data.salaryDay ?? null,
      householdMode: payload.householdDefaults ?? current.data.householdMode,
    });
    return { data };
  },

  saveNotificationSettings: async (payload: NotificationSettingsPayload) => {
    return { data: writeNotificationPreferences(payload) };
  },
};
