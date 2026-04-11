import { apiClient } from '../../../shared/api/client';
export const remindersApi = { list: () => apiClient.get('/reminders') };
