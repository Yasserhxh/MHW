import { beforeEach, describe, expect, it, vi } from 'vitest';

const { post, get } = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
}));

const { isOnboardingCompletedForSession } = vi.hoisted(() => ({
  isOnboardingCompletedForSession: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    post,
    get,
  },
}));

vi.mock('@/features/onboarding/api/onboarding.session', () => ({
  isOnboardingCompletedForSession,
}));

import { authApi } from './auth.api';

describe('authApi', () => {
  beforeEach(() => {
    post.mockReset();
    get.mockReset();
    isOnboardingCompletedForSession.mockReset();
    isOnboardingCompletedForSession.mockReturnValue(false);
  });

  it('maps backend login and profile data into the frontend session shape', async () => {
    post.mockResolvedValueOnce({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpiresAt: '2026-04-13T00:00:00Z',
        userId: 'user-1',
        email: 'amina@example.com',
      },
    });
    get.mockResolvedValueOnce({
      data: {
        userId: 'user-1',
        displayName: 'Amina Bennani',
        language: 'fr-MA',
        timezone: 'Africa/Casablanca',
        createdAt: '2026-04-10T00:00:00Z',
      },
    });

    const response = await authApi.login({
      email: 'amina@example.com',
      password: 'Password123!',
    });

    expect(response.data).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      userId: 'user-1',
      email: 'amina@example.com',
      fullName: 'Amina Bennani',
      onboardingCompleted: false,
      emailVerified: true,
    });
    expect(post).toHaveBeenCalledWith('/auth/login', {
      email: 'amina@example.com',
      password: 'Password123!',
    });
    expect(get).toHaveBeenCalledWith('/users/profile');
  });

  it('falls back to the email when the profile endpoint is unavailable', async () => {
    post.mockResolvedValueOnce({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpiresAt: '2026-04-13T00:00:00Z',
        userId: 'user-1',
        email: 'amina@example.com',
      },
    });
    get.mockRejectedValueOnce(new Error('profile not ready'));

    const response = await authApi.login({
      email: 'amina@example.com',
      password: 'Password123!',
    });

    expect(response.data.fullName).toBe('amina@example.com');
  });

  it('keeps onboarding complete when the local onboarding fallback is already finished', async () => {
    isOnboardingCompletedForSession.mockReturnValue(true);
    post.mockResolvedValueOnce({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpiresAt: '2026-04-13T00:00:00Z',
        userId: 'user-1',
        email: 'amina@example.com',
      },
    });
    get.mockResolvedValueOnce({
      data: {
        userId: 'user-1',
        displayName: 'Amina Bennani',
        language: 'fr-MA',
        timezone: 'Africa/Casablanca',
        createdAt: '2026-04-10T00:00:00Z',
      },
    });

    const response = await authApi.login({
      email: 'amina@example.com',
      password: 'Password123!',
    });

    expect(response.data.onboardingCompleted).toBe(true);
  });

  it('submits only the backend register contract after frontend validation', async () => {
    post.mockResolvedValueOnce({ data: { userId: 'user-2', email: 'sara@example.com' } });

    await authApi.register({
      fullName: 'Sara Bennani',
      email: 'sara@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true,
    });

    expect(post).toHaveBeenCalledWith('/auth/register', {
      email: 'sara@example.com',
      password: 'Password123!',
    });
  });
});
