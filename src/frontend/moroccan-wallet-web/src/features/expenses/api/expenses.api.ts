import { apiClient } from '../../../shared/api/client';
export const expensesApi = { list: () => apiClient.get('/expenses'), create: (payload: unknown) => apiClient.post('/expenses', payload) };
