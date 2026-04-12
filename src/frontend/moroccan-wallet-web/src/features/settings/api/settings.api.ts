import { apiClient } from '../../../shared/api/client';

export const settingsApi = {
  profile: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.get('/settings/profile');
    void apiClient;
    return Promise.resolve({
      data: {
        fullName: 'Mock User',
        currency: 'MAD',
        locale: 'fr-MA',
      },
    });
  },
  saveProfile: (payload: unknown) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.put('/settings/profile', payload);
    void apiClient;
    return Promise.resolve({ data: payload });
  },
};
