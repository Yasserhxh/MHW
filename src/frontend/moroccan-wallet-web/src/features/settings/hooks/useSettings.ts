import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';
import type { UserPreferences } from '@/shared/mocks/appData';

type ProfilePayload = { fullName: string; email: string; language: string; timezone: string };
type PreferencePayload = Partial<Pick<UserPreferences, 'currency' | 'defaultWalletId' | 'salaryDay' | 'dashboardCompactMode' | 'householdDefaults'>>;
type NotificationSettingsPayload = Partial<UserPreferences['notifications']>;

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
