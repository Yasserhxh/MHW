import { apiClient } from '../../../shared/api/client';
export const sharedExpensesApi = { list: () => apiClient.get('/shared-expenses') };
