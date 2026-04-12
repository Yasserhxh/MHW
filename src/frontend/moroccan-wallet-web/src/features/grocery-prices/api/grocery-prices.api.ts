import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockTask } from '@/shared/mocks/mockApi';

export const groceryPricesApi = {
  list: () => withMockTask(() => getMockDb().groceryPrices, 180),
  getById: (id: string) => withMockTask(() => {
    const item = getMockDb().groceryPrices.find((entry) => entry.id === id);
    if (!item) throw new Error('Price entry not found');
    return item;
  }, 180),
  save: (payload: Omit<ReturnType<typeof getMockDb>['groceryPrices'][number], 'id'>, id?: string) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        groceryPrices: id
          ? db.groceryPrices.map((entry) => (entry.id === id ? { ...entry, ...payload } : entry))
          : [...db.groceryPrices, { id: `gp-${Date.now()}`, ...payload }],
      }));
      return true;
    }, 220),
};
