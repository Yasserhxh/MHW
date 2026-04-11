import { apiClient } from '../../../shared/api/client';
export const settingsApi = { profile: () => apiClient.get('/settings/profile'), saveProfile: (payload: unknown) => apiClient.put('/settings/profile', payload) };
