export interface ProfileSettingsValues {
  fullName: string;
  email: string;
  language: string;
  timezone: string;
}

export interface PreferenceSettingsValues {
  locale: string;
  currency: string;
  timezone: string;
  monthlyBudgetPreference?: number | null;
  salaryDay?: number | null;
  householdMode: string;
  defaultWalletId?: string;
  dashboardCompactMode?: boolean;
  notifications?: NotificationSettingsValues;
}

export interface NotificationSettingsValues {
  reminderInApp?: boolean;
  reminderEmail?: boolean;
  sharedExpenseInApp?: boolean;
  budgetWarningInApp?: boolean;
  weeklyDigestEmail?: boolean;
}
