import { apiClient } from '@/shared/api/client';
import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockLatency } from '@/shared/mocks/mockApi';
import type { CreateExpenseRequest, ExpensesSnapshot, ExpenseTransactionListItem } from '../types/expenses.types';

function mapCategoryId(categoryId: string): ExpenseTransactionListItem['category'] {
  const mapping: Record<string, ExpenseTransactionListItem['category']> = {
    'cat-groceries': 'groceries',
    'cat-transport': 'transport',
    'cat-utilities': 'utilities',
    'cat-rent': 'housing',
    'cat-health': 'health',
    'cat-school': 'education',
    'cat-salary': 'salary',
    'cat-freelance': 'salary',
  };
  return mapping[categoryId] ?? 'other';
}

function mapWalletId(walletId: string): ExpenseTransactionListItem['walletId'] {
  const mapping: Record<string, ExpenseTransactionListItem['walletId']> = {
    'wallet-main': 'main-wallet',
    'wallet-cash': 'cash',
    'wallet-household': 'joint-wallet',
    'wallet-savings': 'savings-wallet',
  };
  return mapping[walletId] ?? 'main-wallet';
}

function mapPaymentMethodId(paymentMethod: string): ExpenseTransactionListItem['paymentMethodId'] {
  const normalized = paymentMethod.toLowerCase().replace(/\s+/g, '-');
  if (normalized === 'bank-transfer' || normalized === 'wallet-transfer' || normalized === 'cash') {
    return normalized;
  }
  return 'card';
}

export const expensesApi = {
  getSnapshot: async (): Promise<{ data: ExpensesSnapshot }> => {
    void apiClient;
    const db = getMockDb();
    const transactions = db.transactions.map((transaction) => ({
      ...transaction,
      category: mapCategoryId(transaction.categoryId),
      walletId: mapWalletId(transaction.walletId),
      paymentMethodId: mapPaymentMethodId(transaction.paymentMethod),
      dateLabel: transaction.date,
      categoryLabel: db.categories.find((item) => item.id === transaction.categoryId)?.name ?? 'Other',
      walletLabel: db.wallets.find((item) => item.id === transaction.walletId)?.name ?? 'Wallet',
      paymentMethodLabel: transaction.paymentMethod,
    })) as ExpenseTransactionListItem[];
    const monthTransactions = db.transactions.filter((item) => item.date.startsWith('2026-04'));
    const expenses = monthTransactions.filter((item) => item.type === 'expense');
    const income = monthTransactions.filter((item) => item.type === 'income');
    const categoryTotals = expenses.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.categoryId] = (acc[tx.categoryId] ?? 0) + tx.amount;
      return acc;
    }, {});
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    return withMockLatency({
      summary: {
        spentThisMonth: totalExpense,
        incomeThisMonth: income.reduce((sum, item) => sum + item.amount, 0),
        transactionCount: monthTransactions.length,
        topCategoryLabel: Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
          ? db.categories.find((item) => item.id === Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0])?.name ?? 'Other'
          : 'No category yet',
      },
      transactions,
      categoryBreakdown: Object.entries(categoryTotals).map(([categoryId, amount]) => ({
        category: mapCategoryId(categoryId),
        label: db.categories.find((item) => item.id === categoryId)?.name ?? 'Other',
        amount,
        percent: totalExpense ? Math.round((amount / totalExpense) * 100) : 0,
      })).sort((a, b) => b.amount - a.amount),
      wallets: db.wallets.map((wallet) => ({ id: mapWalletId(wallet.id), label: wallet.name })),
      paymentMethods: [
        { id: 'card' as const, label: 'Card' },
        { id: 'bank-transfer' as const, label: 'Bank transfer' },
        { id: 'cash' as const, label: 'Cash' },
        { id: 'wallet-transfer' as const, label: 'Wallet transfer' },
      ],
    } satisfies ExpensesSnapshot, 220);
  },
  create: async (payload: CreateExpenseRequest): Promise<{ data: ExpenseTransactionListItem }> => {
    void apiClient;
    const next = updateMockDb((db) => {
      const paymentMethodLabel = payload.paymentMethodId === 'bank-transfer'
        ? 'Bank transfer'
        : payload.paymentMethodId === 'wallet-transfer'
          ? 'Wallet transfer'
          : payload.paymentMethodId === 'cash'
            ? 'Cash'
            : 'Card';
      return {
        ...db,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: payload.type,
            title: payload.title,
            amount: payload.amount,
            currency: 'MAD',
            categoryId: payload.category,
            walletId: payload.walletId,
            paymentMethod: paymentMethodLabel,
            date: payload.date,
            notes: payload.notes,
            createdAt: new Date().toISOString(),
          },
          ...db.transactions,
        ],
      };
    });
    const tx = next.transactions[0];
    return withMockLatency({
      ...tx,
      category: mapCategoryId(tx.categoryId),
      walletId: mapWalletId(tx.walletId),
      paymentMethodId: payload.paymentMethodId,
      dateLabel: tx.date,
      categoryLabel: next.categories.find((item) => item.id === tx.categoryId)?.name ?? 'Other',
      walletLabel: next.wallets.find((item) => item.id === tx.walletId)?.name ?? 'Wallet',
      paymentMethodLabel: tx.paymentMethod,
    } as ExpenseTransactionListItem, 220);
  },
};
