import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { Product, PriceEntry, AddPriceRequest } from '../types/grocery-prices.types';

export const groceryPricesApi = {
  products: (search?: string) =>
    apiClient.get<Product[]>('/grocery-prices/products', { params: { search } }),

  priceHistory: (productId: string) =>
    apiClient.get<PriceEntry[]>(`/grocery-prices/products/${productId}/history`),

  recentEntries: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResult<PriceEntry>>('/grocery-prices/recent', { params }),

  addPrice: (data: AddPriceRequest) =>
    apiClient.post<PriceEntry>('/grocery-prices', data),

  toggleFavorite: (productId: string) =>
    apiClient.post(`/grocery-prices/products/${productId}/favorite`),

  deleteEntry: (id: string) => apiClient.delete(`/grocery-prices/${id}`),
};
