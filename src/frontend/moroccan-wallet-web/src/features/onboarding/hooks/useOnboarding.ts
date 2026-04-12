import { useMutation, useQuery } from '@tanstack/react-query';
import { onboardingApi, type OnboardingPayload } from '../api/onboarding.api';

export const onboardingQueryKey = ['onboarding'] as const;

export function useOnboarding() {
  return useQuery({
    queryKey: onboardingQueryKey,
    queryFn: async () => (await onboardingApi.getProfile()).data,
  });
}

export function useSaveOnboarding() {
  return useMutation({
    mutationFn: async (payload: OnboardingPayload) => (await onboardingApi.saveProfile(payload)).data,
  });
}
