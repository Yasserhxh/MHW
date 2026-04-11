import { apiClient } from '../../../shared/api/client';
export const groceryPricesApi = { list: () => apiClient.get('/grocery-prices') };
