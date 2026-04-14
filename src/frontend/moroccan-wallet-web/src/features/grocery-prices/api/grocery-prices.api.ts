import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type {
  AddPriceRequest,
  GroceryFilters,
  GroceryPriceHistoryEntry,
  GroceryProductDetail,
  GroceryProductListItem,
} from '../types/grocery-prices.types';

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

type CreateProductResponse = {
  id: string;
  name: string;
};

function mapHistoryEntry(entry: PriceHistoryResponse['entries'][number]): GroceryPriceHistoryEntry {
  return {
    id: entry.id,
    price: entry.price,
    currency: entry.currency,
    storeName: entry.storeName ?? undefined,
    recordedAt: entry.observedAt,
  };
}

function buildListItem(product: ProductDto, entries: PriceEntryDto[]): GroceryProductListItem {
  const sortedEntries = [...entries].sort((left, right) => right.observedAt.localeCompare(left.observedAt));
  const latestEntry = sortedEntries[0];
  const cheapestRecentPrice = sortedEntries.length ? Math.min(...sortedEntries.map((entry) => entry.price)) : null;

  return {
    id: product.id,
    name: product.name,
    category: product.category ?? undefined,
    unit: product.unit ?? undefined,
    isFavorite: product.isFavorite,
    latestPrice: latestEntry?.price ?? product.latestPrice ?? null,
    latestCurrency: latestEntry?.currency ?? product.latestCurrency ?? null,
    cheapestRecentPrice,
    lastUpdated: latestEntry?.observedAt ?? null,
    latestStoreName: latestEntry?.storeName ?? undefined,
  };
}

async function fetchProducts(filters: GroceryFilters = {}) {
  const { data } = await apiClient.get<PagedResult<ProductDto>>('/grocery-prices/products', {
    params: {
      search: filters.search || undefined,
      category: filters.category || undefined,
      favoritesOnly: filters.favoritesOnly || false,
      page: 1,
      pageSize: 100,
    },
  });

  return data.items;
}

async function fetchEntries(productId?: string) {
  const { data } = await apiClient.get<PagedResult<PriceEntryDto>>('/grocery-prices/entries', {
    params: {
      productId: productId || undefined,
      page: 1,
      pageSize: 100,
    },
  });

  return data.items;
}

export const groceryPricesApi = {
  list: async (filters: GroceryFilters = {}) => {
    const [products, entries] = await Promise.all([fetchProducts(filters), fetchEntries()]);
    const entriesByProductId = new Map<string, PriceEntryDto[]>();

    for (const entry of entries) {
      const group = entriesByProductId.get(entry.productId) ?? [];
      group.push(entry);
      entriesByProductId.set(entry.productId, group);
    }

    return {
      data: products.map((product) => buildListItem(product, entriesByProductId.get(product.id) ?? [])),
    };
  },

  getById: async (productId: string) => {
    const historyResponse = await apiClient.get<PriceHistoryResponse>(`/grocery-prices/products/${productId}/history`);
    const history = historyResponse.data.entries.map(mapHistoryEntry);
    const productSearchResponse = await apiClient.get<PagedResult<ProductDto>>('/grocery-prices/products', {
      params: { search: historyResponse.data.productName, page: 1, pageSize: 100 },
    });

    const product = productSearchResponse.data.items.find((item) => item.id === productId);
    const latestEntry = history[0];

    return {
      data: {
        id: productId,
        name: historyResponse.data.productName,
        category: product?.category ?? undefined,
        unit: product?.unit ?? undefined,
        isFavorite: product?.isFavorite ?? false,
        latestPrice: latestEntry?.price ?? product?.latestPrice ?? null,
        latestCurrency: latestEntry?.currency ?? product?.latestCurrency ?? null,
        cheapestRecentPrice: history.length ? Math.min(...history.map((entry) => entry.price)) : null,
        lastUpdated: latestEntry?.recordedAt ?? null,
        history,
      } satisfies GroceryProductDetail,
    };
  },

  save: async (payload: AddPriceRequest) => {
    let productId = payload.productId;

    if (!productId) {
      const { data } = await apiClient.post<CreateProductResponse>('/grocery-prices/products', {
        name: payload.productName,
        category: payload.productCategory?.trim() || null,
        unit: payload.productUnit?.trim() || null,
        barcode: null,
      });
      productId = data.id;
    }

    return apiClient.post('/grocery-prices/entries', {
      productId,
      price: payload.price,
      currency: payload.currency,
      storeName: payload.storeName?.trim() || null,
      storeLocation: payload.notes?.trim() || null,
      observedAt: payload.date ?? new Date().toISOString(),
    });
  },

  toggleFavorite: async (productId: string, isFavorite: boolean) => {
    if (isFavorite) {
      return apiClient.delete(`/grocery-prices/favorites/${productId}`);
    }

    return apiClient.post(`/grocery-prices/favorites/${productId}`);
  },
};
