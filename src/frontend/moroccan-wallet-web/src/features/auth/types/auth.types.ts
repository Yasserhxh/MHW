export type AuthTokens = { accessToken: string; refreshToken: string };

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};
export type ForgotPasswordRequest = { email: string };
export type ResetPasswordRequest = { token: string; newPassword: string };
export type VerifyEmailRequest = { token: string };

export type LoginResponse = AuthTokens & {
  userId: string;
  email: string;
  fullName: string;
  onboardingCompleted: boolean;
  emailVerified: boolean;
};
