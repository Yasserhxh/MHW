import { formatDateShort } from '@/shared/utils/format';
import type {
  CreateExpenseRequest,
  ExpenseCategoryBreakdown,
  ExpenseTransaction,
  ExpenseTransactionListItem,
  ExpenseSummary,
  ExpensesSnapshot,
  PaymentMethodOption,
  WalletOption,
} from '../types/expenses.types';

const wallets: WalletOption[] = [
  { id: 'main-wallet', label: 'Main Wallet' },
  { id: 'cash', label: 'Cash' },
  { id: 'joint-wallet', label: 'Joint Household Wallet' },
  { id: 'savings-wallet', label: 'Savings Wallet' },
];

const paymentMethods: PaymentMethodOption[] = [
  { id: 'card', label: 'Card' },
  { id: 'bank-transfer', label: 'Bank transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'wallet-transfer', label: 'Wallet transfer' },
];

let transactions: ExpenseTransaction[] = [
  {
    id: 'exp-1',
    title: 'Marjane groceries',
    amount: 462,
    currency: 'MAD',
    type: 'expense',
    category: 'groceries',
    walletId: 'main-wallet',
    paymentMethodId: 'card',
    date: '2026-04-11',
    notes: 'Weekly stock-up for the apartment',
    createdAt: '2026-04-11T16:10:00Z',
  },
  {
    id: 'exp-2',
    title: 'Freelance payout',
    amount: 2400,
    currency: 'MAD',
    type: 'income',
    category: 'salary',
    walletId: 'main-wallet',
    paymentMethodId: 'bank-transfer',
    date: '2026-04-09',
    notes: 'April side project payment',
    createdAt: '2026-04-09T11:30:00Z',
  },
  {
    id: 'exp-3',
    title: 'Taxi to office',
    amount: 38,
    currency: 'MAD',
    type: 'expense',
    category: 'transport',
    walletId: 'cash',
    paymentMethodId: 'cash',
    date: '2026-04-08',
    createdAt: '2026-04-08T08:20:00Z',
  },
  {
    id: 'exp-4',
    title: 'Internet bill',
    amount: 349,
    currency: 'MAD',
    type: 'expense',
    category: 'utilities',
    walletId: 'joint-wallet',
    paymentMethodId: 'bank-transfer',
    date: '2026-04-05',
    notes: 'Fiber monthly bill',
    createdAt: '2026-04-05T19:00:00Z',
  },
  {
    id: 'exp-5',
    title: 'Pharmacy essentials',
    amount: 192,
    currency: 'MAD',
    type: 'expense',
    category: 'health',
    walletId: 'main-wallet',
    paymentMethodId: 'card',
    date: '2026-04-03',
    createdAt: '2026-04-03T14:45:00Z',
  },
];

function getWalletLabel(walletId: ExpenseTransaction['walletId']) {
  return wallets.find((wallet) => wallet.id === walletId)?.label ?? walletId;
}

function getPaymentMethodLabel(paymentMethodId: ExpenseTransaction['paymentMethodId']) {
  return paymentMethods.find((method) => method.id === paymentMethodId)?.label ?? paymentMethodId;
}

function getCategoryLabel(category: ExpenseTransaction['category']) {
  return (
    {
      groceries: 'Groceries',
      transport: 'Transport',
      utilities: 'Utilities',
      housing: 'Housing',
      health: 'Health',
      salary: 'Salary',
      education: 'Education',
      entertainment: 'Entertainment',
      other: 'Other',
    }[category] ?? category
  );
}

function toListItem(transaction: ExpenseTransaction): ExpenseTransactionListItem {
  return {
    ...transaction,
    dateLabel: formatDateShort(transaction.date),
    categoryLabel: getCategoryLabel(transaction.category),
    walletLabel: getWalletLabel(transaction.walletId),
    paymentMethodLabel: getPaymentMethodLabel(transaction.paymentMethodId),
  };
}

function buildSummary(items: ExpenseTransaction[]): ExpenseSummary {
  const spent = items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const income = items.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const categories = buildCategoryBreakdown(items);
  return {
    spentThisMonth: spent,
    incomeThisMonth: income,
    transactionCount: items.length,
    topCategoryLabel: categories[0]?.label ?? 'No category yet',
  };
}

function buildCategoryBreakdown(items: ExpenseTransaction[]): ExpenseCategoryBreakdown[] {
  const expenseItems = items.filter((item) => item.type === 'expense');
  const total = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const totals = new Map<string, number>();

  expenseItems.forEach((item) => {
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
  });

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category: category as ExpenseTransaction['category'],
      label: getCategoryLabel(category as ExpenseTransaction['category']),
      amount,
      percent: total ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getExpensesSnapshotMock(): ExpensesSnapshot {
  const orderedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(toListItem);

  return {
    summary: buildSummary(transactions),
    transactions: orderedTransactions,
    categoryBreakdown: buildCategoryBreakdown(transactions),
    wallets,
    paymentMethods,
  };
}

export function createExpenseMock(payload: CreateExpenseRequest): ExpenseTransactionListItem {
  const nextTransaction: ExpenseTransaction = {
    id: `exp-${Date.now()}`,
    currency: 'MAD',
    createdAt: new Date().toISOString(),
    ...payload,
  };

  transactions = [nextTransaction, ...transactions];
  return toListItem(nextTransaction);
}
