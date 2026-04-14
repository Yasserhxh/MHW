import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
    post,
    delete: del,
  },
}));

import { groceryPricesApi } from './grocery-prices.api';

describe('groceryPricesApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    del.mockReset();
  });

  it('maps real products and entries into a product-first grocery list', async () => {
    get
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'product-1',
              name: 'Milk',
              category: 'Dairy',
              unit: '1L',
              isVerified: true,
              isFavorite: true,
              latestPrice: 14.5,
              latestCurrency: 'MAD',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 100,
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'entry-2',
              productId: 'product-1',
              productName: 'Milk',
              price: 13.5,
              currency: 'MAD',
              storeName: 'Marjane',
              storeLocation: 'Casablanca',
              observedAt: '2026-04-13T00:00:00Z',
            },
            {
              id: 'entry-1',
              productId: 'product-1',
              productName: 'Milk',
              price: 14.5,
              currency: 'MAD',
              storeName: 'Carrefour',
              storeLocation: 'Casablanca',
              observedAt: '2026-04-14T00:00:00Z',
            },
          ],
          total: 2,
          page: 1,
          pageSize: 100,
        },
      });

    const response = await groceryPricesApi.list({ favoritesOnly: true });

    expect(get).toHaveBeenCalledWith('/grocery-prices/products', {
      params: { search: undefined, category: undefined, favoritesOnly: true, page: 1, pageSize: 100 },
    });
    expect(response.data[0]).toMatchObject({
      id: 'product-1',
      name: 'Milk',
      isFavorite: true,
      latestPrice: 14.5,
      cheapestRecentPrice: 13.5,
      latestStoreName: 'Carrefour',
    });
  });

  it('builds product detail from real history and favorite state', async () => {
    get
      .mockResolvedValueOnce({
        data: {
          productId: 'product-1',
          productName: 'Milk',
          entries: [
            { id: 'entry-1', price: 14.5, currency: 'MAD', storeName: 'Carrefour', observedAt: '2026-04-14T00:00:00Z' },
            { id: 'entry-2', price: 13.5, currency: 'MAD', storeName: 'Marjane', observedAt: '2026-04-13T00:00:00Z' },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'product-1',
              name: 'Milk',
              category: 'Dairy',
              unit: '1L',
              isVerified: true,
              isFavorite: true,
              latestPrice: 14.5,
              latestCurrency: 'MAD',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 100,
        },
      });

    const response = await groceryPricesApi.getById('product-1');

    expect(response.data).toMatchObject({
      id: 'product-1',
      name: 'Milk',
      category: 'Dairy',
      unit: '1L',
      isFavorite: true,
      latestPrice: 14.5,
      cheapestRecentPrice: 13.5,
    });
    expect(response.data.history).toHaveLength(2);
  });

  it('uses the real favorite add/remove endpoints', async () => {
    post.mockResolvedValueOnce({ data: { isFavorite: true } });
    del.mockResolvedValueOnce({ data: null });

    await groceryPricesApi.toggleFavorite('product-1', false);
    await groceryPricesApi.toggleFavorite('product-1', true);

    expect(post).toHaveBeenCalledWith('/grocery-prices/favorites/product-1');
    expect(del).toHaveBeenCalledWith('/grocery-prices/favorites/product-1');
  });
});
