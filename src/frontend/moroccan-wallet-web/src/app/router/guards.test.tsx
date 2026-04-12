import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RequireAuth, RequireGuest, RequireIncompleteOnboarding, RequireOnboarding } from './guards';
import { authStore } from '@/features/auth/store/auth.store';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderGuard(element: React.ReactNode, initialEntry = '/current') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="*" element={<>{element}<LocationProbe /></>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('route guards', () => {
  it('redirects unauthenticated users to login', () => {
    renderGuard(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('redirects authenticated but unverified users to verify email', () => {
    authStore.setState({
      isAuthenticated: true,
      emailVerified: false,
      onboardingCompleted: false,
      accessToken: 'token',
      refreshToken: 'refresh',
      userId: 'user-1',
      email: 'amina@example.com',
      fullName: 'Amina El Idrissi',
    });

    renderGuard(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/verify-email');
  });

  it('redirects verified users without onboarding to onboarding', () => {
    authStore.setState({
      isAuthenticated: true,
      emailVerified: true,
      onboardingCompleted: false,
      accessToken: 'token',
      refreshToken: 'refresh',
      userId: 'user-1',
      email: 'amina@example.com',
      fullName: 'Amina El Idrissi',
    });

    renderGuard(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/onboarding');
  });

  it('renders authenticated onboarding-complete users in protected routes', () => {
    authStore.setState({
      isAuthenticated: true,
      emailVerified: true,
      onboardingCompleted: true,
      accessToken: 'token',
      refreshToken: 'refresh',
      userId: 'user-1',
      email: 'amina@example.com',
      fullName: 'Amina El Idrissi',
    });

    renderGuard(
      <RequireAuth>
        <div>Protected content</div>
      </RequireAuth>
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/current');
  });

  it('redirects guests away from login when onboarding is complete', () => {
    authStore.setState({
      isAuthenticated: true,
      emailVerified: true,
      onboardingCompleted: true,
      accessToken: 'token',
      refreshToken: 'refresh',
      userId: 'user-1',
      email: 'amina@example.com',
      fullName: 'Amina El Idrissi',
    });

    renderGuard(
      <RequireGuest>
        <div>Guest content</div>
      </RequireGuest>,
      '/login'
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard');
  });

  it('keeps incomplete onboarding users inside onboarding flow', () => {
    authStore.setState({
      isAuthenticated: true,
      emailVerified: true,
      onboardingCompleted: false,
      accessToken: 'token',
      refreshToken: 'refresh',
      userId: 'user-1',
      email: 'amina@example.com',
      fullName: 'Amina El Idrissi',
    });

    renderGuard(
      <RequireIncompleteOnboarding>
        <div>Onboarding step</div>
      </RequireIncompleteOnboarding>,
      '/onboarding'
    );

    expect(screen.getByText('Onboarding step')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/onboarding');
  });

  it('blocks app routes until onboarding is complete', () => {
    authStore.setState({
      isAuthenticated: true,
      emailVerified: true,
      onboardingCompleted: false,
      accessToken: 'token',
      refreshToken: 'refresh',
      userId: 'user-1',
      email: 'amina@example.com',
      fullName: 'Amina El Idrissi',
    });

    renderGuard(
      <RequireOnboarding>
        <div>App shell</div>
      </RequireOnboarding>,
      '/dashboard'
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/onboarding');
  });
});
