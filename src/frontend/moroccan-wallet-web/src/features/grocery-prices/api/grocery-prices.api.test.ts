import { describe, expect, it } from 'vitest';
import { groceryPricesApi } from './grocery-prices.api';

describe('groceryPricesApi', () => {
  it('lists grocery price entries', async () => {
    const response = await groceryPricesApi.list();

    expect(response.data.length).toBeGreaterThanOrEqual(10);
  });

  it('returns a product price entry by id', async () => {
    const response = await groceryPricesApi.getById('gp-1');

    expect(response.data.productName).toBe('Olive oil 1L');
  });

  it('creates a new grocery price entry', async () => {
    await groceryPricesApi.save({
      productName: 'Bananas',
      storeName: 'Local market',
      price: 11,
      unit: 'kg',
      date: '2026-04-12',
      notes: 'Morning price',
      isFavorite: false,
    });

    const response = await groceryPricesApi.list();
    expect(response.data.some((item) => item.productName === 'Bananas')).toBe(true);
  });
});
