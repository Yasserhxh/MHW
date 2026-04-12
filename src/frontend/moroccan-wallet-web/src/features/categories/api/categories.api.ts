import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockTask } from '@/shared/mocks/mockApi';

export interface CategoryPayload {
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
}

export const categoriesApi = {
  list: () =>
    withMockTask(() => {
      const db = getMockDb();
      return db.categories.map((category) => ({
        ...category,
        usageCount: db.transactions.filter((tx) => tx.categoryId === category.id).length,
        totalAmount: db.transactions.filter((tx) => tx.categoryId === category.id).reduce((sum, tx) => sum + tx.amount, 0),
      }));
    }, 180),
  save: (payload: CategoryPayload, id?: string) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        categories: id
          ? db.categories.map((category) => (category.id === id ? { ...category, ...payload } : category))
          : [...db.categories, { id: `category-${Date.now()}`, isDefault: false, ...payload }],
      }));
      return true;
    }, 220),
};
