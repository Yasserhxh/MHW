export type AuthTokens = { accessToken: string; refreshToken: string };

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { firstName: string; lastName: string; email: string; password: string };
export type ForgotPasswordRequest = { email: string };
export type ResetPasswordRequest = { email: string; token: string; newPassword: string };
export type VerifyEmailRequest = { email: string; token: string };

export type LoginResponse = AuthTokens & { userId: string; email: string; fullName?: string };
