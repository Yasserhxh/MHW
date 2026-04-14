import { authStore } from '@/features/auth/store/auth.store';
import type { OnboardingProfile } from '@/shared/mocks/appData';
import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';

const STORAGE_KEY = 'mhw-onboarding-profiles';

type SessionIdentity = {
  userId?: string | null;
  email?: string | null;
  fullName?: string | null;
};

function resolveSessionIdentity(identity?: SessionIdentity) {
  const state = authStore.getState();
  return {
    userId: identity?.userId ?? state.userId,
    email: identity?.email ?? state.email,
    fullName: identity?.fullName ?? state.fullName,
  };
}

function getSessionKey(identity?: SessionIdentity) {
  const { userId, email } = resolveSessionIdentity(identity);
  if (userId) {
    return userId;
  }

  if (email?.trim()) {
    return email.trim().toLowerCase();
  }

  return getMockDb().currentUserId;
}

function getSeededProfile(identity?: SessionIdentity): OnboardingProfile {
  const { userId, email, fullName } = resolveSessionIdentity(identity);
  const db = getMockDb();

  if (userId && db.onboarding[userId]) {
    return db.onboarding[userId];
  }

  if (!userId && !email && db.onboarding[db.currentUserId]) {
    return db.onboarding[db.currentUserId];
  }

  const matchingUser = email
    ? db.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
    : null;

  if (matchingUser && db.onboarding[matchingUser.id]) {
    return db.onboarding[matchingUser.id];
  }

  return {
    completed: false,
    fullName: fullName ?? email ?? '',
    language: 'fr-MA',
    currency: 'MAD',
    timezone: 'Africa/Casablanca',
    householdMode: 'just-me',
  };
}

function readProfiles() {
  if (typeof window === 'undefined') {
    return {} as Record<string, OnboardingProfile>;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {} as Record<string, OnboardingProfile>;
  }

  try {
    return JSON.parse(stored) as Record<string, OnboardingProfile>;
  } catch {
    return {} as Record<string, OnboardingProfile>;
  }
}

function writeProfiles(profiles: Record<string, OnboardingProfile>) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }
}

export function getOnboardingProfileForSession() {
  return getOnboardingProfile();
}

export function getOnboardingProfile(identity?: SessionIdentity) {
  const key = getSessionKey(identity);
  const profiles = readProfiles();

  if (key && profiles[key]) {
    return profiles[key];
  }

  return getSeededProfile(identity);
}

export function isOnboardingCompletedForSession(identity?: SessionIdentity) {
  return getOnboardingProfile(identity)?.completed ?? false;
}

export function saveOnboardingProfileForSession(
  payload: Omit<OnboardingProfile, 'completed'> & Partial<Pick<OnboardingProfile, 'completed'>>
) {
  const key = getSessionKey();
  if (!key) {
    throw new Error('You need to sign in before completing onboarding.');
  }

  const profile: OnboardingProfile = {
    ...getSeededProfile(),
    ...payload,
    completed: payload.completed ?? true,
  };

  const profiles = readProfiles();
  profiles[key] = profile;
  writeProfiles(profiles);

  updateMockDb((db) => {
    const { userId, email } = resolveSessionIdentity();
    const matchingUserId =
      userId ??
      (email ? db.users.find((user) => user.email.toLowerCase() === email.toLowerCase())?.id : null) ??
      db.currentUserId;

    return {
      ...db,
      onboarding: {
        ...db.onboarding,
        [matchingUserId]: profile,
      },
      users: db.users.map((user) =>
        user.id === matchingUserId ? { ...user, fullName: profile.fullName } : user
      ),
      preferences: {
        ...db.preferences,
        [matchingUserId]: {
          ...db.preferences[matchingUserId],
          currency: profile.currency,
          salaryDay: profile.salaryDay,
          householdDefaults: profile.householdMode,
        },
      },
    };
  });

  return profile;
}
