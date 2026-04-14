import { withMockApiResponse, withMockMutation } from './onboarding.helpers';
import { getOnboardingProfileForSession, saveOnboardingProfileForSession } from './onboarding.session';

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
      return getOnboardingProfileForSession();
    }),
  saveProfile: (payload: OnboardingPayload) =>
    withMockMutation(() => {
      return saveOnboardingProfileForSession(payload);
    }),
};
