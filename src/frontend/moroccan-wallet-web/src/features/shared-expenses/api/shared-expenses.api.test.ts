import { describe, expect, it } from 'vitest';
import { sharedExpensesApi } from './shared-expenses.api';

describe('sharedExpensesApi', () => {
  it('returns the household overview', async () => {
    const response = await sharedExpensesApi.getOverview();

    expect(response.data.members.length).toBeGreaterThan(1);
    expect(response.data.sharedExpenses.length).toBeGreaterThan(0);
  });

  it('returns a shared expense detail', async () => {
    const response = await sharedExpensesApi.getDetail('se-1');

    expect(response.data.title).toBe('April Rent');
    expect(response.data.participantIds).toHaveLength(3);
  });

  it('adds a new shared expense', async () => {
    await sharedExpensesApi.addExpense({
      title: 'Shared fruit run',
      amount: 120,
      categoryId: 'cat-groceries',
      paidByMemberId: 'member-1',
      participantIds: ['member-1', 'member-2', 'member-3'],
      date: '2026-04-12',
      notes: 'Weekend refill',
    });

    const overview = await sharedExpensesApi.getOverview();
    expect(overview.data.sharedExpenses.some((expense) => expense.title === 'Shared fruit run')).toBe(true);
  });
});
