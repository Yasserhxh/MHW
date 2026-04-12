import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockTask } from '@/shared/mocks/mockApi';

export const sharedExpensesApi = {
  getOverview: () =>
    withMockTask(() => {
      const db = getMockDb();
      return db.household;
    }, 180),
  getDetail: (id: string) =>
    withMockTask(() => {
      const db = getMockDb();
      const expense = db.household.sharedExpenses.find((item) => item.id === id);
      if (!expense) throw new Error('Shared expense not found');
      return expense;
    }, 180),
  addExpense: (payload: {
    title: string;
    amount: number;
    categoryId: string;
    paidByMemberId: string;
    participantIds: string[];
    date: string;
    notes?: string;
  }) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        household: {
          ...db.household,
          sharedExpenses: [...db.household.sharedExpenses, { id: `se-${Date.now()}`, createdAt: new Date().toISOString(), ...payload }],
        },
      }));
      return true;
    }, 220),
};
