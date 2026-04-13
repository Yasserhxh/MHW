import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type { AddPriceRequest, GroceryPriceListItem } from '../types/grocery-prices.types';

type ProductDto = {
  id: string;
  name: string;
  category?: string | null;
  unit?: string | null;
  barcode?: string | null;
  isVerified: boolean;
  isFavorite: boolean;
  latestPrice?: number | null;
  latestCurrency?: string | null;
};

type PriceEntryDto = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  currency: string;
  storeName?: string | null;
  storeLocation?: string | null;
  observedAt: string;
};

type PriceHistoryResponse = {
  productId: string;
  productName: string;
  entries: Array<{
    id: string;
    price: number;
    currency: string;
    storeName?: string | null;
    observedAt: string;
  }>;
};

async function fetchProducts() {
  const { data } = await apiClient.get<PagedResult<ProductDto>>('/grocery-prices/products', {
    params: { page: 1, pageSize: 100 },
  });
  return data.items;
}

function toListItem(entry: PriceEntryDto, product?: ProductDto | null): GroceryPriceListItem {
  return {
    id: entry.id,
    productId: entry.productId,
    productName: entry.productName,
    price: entry.price,
    currency: entry.currency,
    storeName: entry.storeName ?? 'Unknown store',
    recordedAt: entry.observedAt,
    unit: product?.unit ?? 'unit',
    date: entry.observedAt.slice(0, 10),
    isFavorite: product?.isFavorite ?? false,
    notes: entry.storeLocation ?? undefined,
  };
}

export const groceryPricesApi = {
  list: async () => {
    const [entriesResponse, products] = await Promise.all([
      apiClient.get<PagedResult<PriceEntryDto>>('/grocery-prices/entries', {
        params: { page: 1, pageSize: 100 },
      }),
      fetchProducts(),
    ]);

    const productsMap = new Map(products.map((product) => [product.id, product]));

    return {
      data: entriesResponse.data.items.map((entry) => toListItem(entry, productsMap.get(entry.productId))),
    };
  },

  getById: async (id: string) => {
    const [entriesResponse, products] = await Promise.all([
      apiClient.get<PagedResult<PriceEntryDto>>('/grocery-prices/entries', {
        params: { page: 1, pageSize: 100 },
      }),
      fetchProducts(),
    ]);

    const entry = entriesResponse.data.items.find((item) => item.id === id);
    if (!entry) {
      throw new Error('Price entry not found');
    }

    await apiClient.get<PriceHistoryResponse>(`/grocery-prices/products/${entry.productId}/history`);

    return {
      data: toListItem(
        entry,
        products.find((item) => item.id === entry.productId)
      ),
    };
  },

  save: async (payload: AddPriceRequest) => {
    let productId = payload.productId;

    if (!productId) {
      const { data } = await apiClient.post<{ id: string; name: string }>('/grocery-prices/products', {
        name: payload.productName,
        category: payload.productCategory ?? null,
        unit: payload.productUnit ?? null,
        barcode: null,
      });
      productId = data.id;
    }

    return apiClient.post('/grocery-prices/entries', {
      productId,
      price: payload.price,
      currency: payload.currency,
      storeName: payload.storeName,
      storeLocation: payload.notes ?? null,
      observedAt: payload.date ?? new Date().toISOString(),
    });
  },
};
