import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';

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

const key = ['settings'] as const;

export function useProfileSettings() {
  return useQuery({ queryKey: [...key, 'profile'], queryFn: async () => (await settingsApi.getProfile()).data });
}

export function usePreferenceSettings() {
  return useQuery({ queryKey: [...key, 'preferences'], queryFn: async () => (await settingsApi.getPreferences()).data });
}

export function useSaveSettings(kind: 'profile' | 'preferences' | 'notifications') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProfilePayload | PreferencePayload | NotificationSettingsPayload) => {
      if (kind === 'profile') return (await settingsApi.saveProfile(payload)).data;
      if (kind === 'notifications') return (await settingsApi.saveNotificationSettings(payload)).data;
      return (await settingsApi.savePreferences(payload)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
