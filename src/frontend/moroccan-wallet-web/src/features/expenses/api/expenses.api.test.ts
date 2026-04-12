import { describe, expect, it } from 'vitest';
import { expensesApi } from './expenses.api';
import { getMockDb } from '@/shared/mocks/mockDb';

describe('expensesApi', () => {
  it('returns a snapshot with seeded summaries and transactions', async () => {
    const response = await expensesApi.getSnapshot();

    expect(response.data.summary.transactionCount).toBeGreaterThan(0);
    expect(response.data.transactions.length).toBeGreaterThanOrEqual(20);
    expect(response.data.wallets).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'main-wallet', label: 'Main Bank Wallet' })])
    );
  });

  it('creates a new transaction and exposes it at the top of the snapshot', async () => {
    const created = await expensesApi.create({
      type: 'expense',
      title: 'Fresh bread',
      amount: 14,
      category: 'cat-groceries',
      walletId: 'wallet-main',
      paymentMethodId: 'cash',
      date: '2026-04-12',
      notes: 'Neighborhood bakery',
    });

    const db = getMockDb();
    const snapshot = await expensesApi.getSnapshot();

    expect(created.data.title).toBe('Fresh bread');
    expect(created.data.paymentMethodLabel).toBe('Cash');
    expect(db.transactions[0].title).toBe('Fresh bread');
    expect(snapshot.data.transactions[0].title).toBe('Fresh bread');
    expect(snapshot.data.summary.transactionCount).toBe(7);
  });
});
