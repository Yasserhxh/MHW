import { describe, expect, it } from 'vitest';
import { authApi } from './auth.api';
import { getMockDb } from '@/shared/mocks/mockDb';

describe('authApi', () => {
  it('logs in an existing seeded user', async () => {
    const response = await authApi.login({
      email: 'amina@example.com',
      password: 'Password123!',
    });

    expect(response.data.email).toBe('amina@example.com');
    expect(response.data.emailVerified).toBe(true);
    expect(response.data.onboardingCompleted).toBe(true);
    expect(response.data.accessToken).toContain('mock-access-user-1');
  });

  it('registers a new user and seeds onboarding defaults', async () => {
    await authApi.register({
      fullName: 'Sara Bennani',
      email: 'sara@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true,
    });

    const db = getMockDb();
    const createdUser = db.users.find((user) => user.email === 'sara@example.com');

    expect(createdUser).toBeDefined();
    expect(createdUser?.emailVerified).toBe(false);
    expect(db.currentUserId).toBe(createdUser?.id);
    expect(db.onboarding[createdUser!.id]).toMatchObject({
      completed: false,
      currency: 'MAD',
      timezone: 'Africa/Casablanca',
      householdMode: 'just-me',
    });
  });

  it('verifies the current user email when a token is provided', async () => {
    await authApi.register({
      fullName: 'New User',
      email: 'new.user@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true,
    });

    await authApi.verifyEmail({ token: 'mock-token' });

    const db = getMockDb();
    const currentUser = db.users.find((user) => user.id === db.currentUserId);

    expect(currentUser?.emailVerified).toBe(true);
  });

  it('rejects login with invalid credentials', async () => {
    await expect(
      authApi.login({
        email: 'amina@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid email or password.');
  });
});
