import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { authStore } from '@/features/auth/store/auth.store';

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  email: string;
};

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL ?? 'https://localhost:7089';
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${getApiBaseUrl()}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry || original.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (refreshing) {
      return new Promise((resolve) => {
        queue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    refreshing = true;

    try {
      const refreshToken = authStore.getState().refreshToken;
      if (!refreshToken) {
        throw new Error('Missing refresh token');
      }

      const { data } = await axios.post<RefreshResponse>(`${getApiBaseUrl()}/api/v1/auth/refresh`, { refreshToken });
      authStore.getState().setTokens(data.accessToken, data.refreshToken);

      queue.forEach((resolve) => resolve(data.accessToken));
      queue = [];

      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      queue = [];
      authStore.getState().clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      refreshing = false;
    }
  }
);
