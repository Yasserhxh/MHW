import { describe, expect, it } from 'vitest';
import { categoriesApi } from './categories.api';

describe('categoriesApi', () => {
  it('lists categories with usage counts and totals', async () => {
    const response = await categoriesApi.list();

    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0]).toHaveProperty('usageCount');
    expect(response.data[0]).toHaveProperty('totalAmount');
  });

  it('creates a custom category', async () => {
    await categoriesApi.save({
      name: 'Pet Care',
      type: 'expense',
      color: 'pink',
      icon: 'paw-print',
    });

    const response = await categoriesApi.list();
    expect(response.data.some((category) => category.name === 'Pet Care')).toBe(true);
  });
});
