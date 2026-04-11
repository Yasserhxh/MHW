import { apiClient } from '../../../shared/api/client';
export const dashboardApi = { overview: () => apiClient.get('/dashboard/overview') };
