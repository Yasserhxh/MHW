import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type {
  CreateExpenseRequest,
  ExpenseCategoryBreakdown,
  ExpenseDetail,
  ExpensesSnapshot,
  ExpenseTransactionListItem,
  PaymentMethodOption,
} from '../types/expenses.types';

type ExpenseSummaryResponse = {
  year: number;
  month: number;
  totalSpent: number;
  totalBudget: number;
  byCategory: Array<{
    categoryId?: string | null;
    categoryName: string;
    total: number;
    budget: number;
    count: number;
  }>;
};

type ExpenseDto = {
  id: string;
  categoryId?: string | null;
  categoryName?: string | null;
  walletId?: string | null;
  walletName?: string | null;
  amount: number;
  currency: string;
  type: string;
  paymentMethod?: string | null;
  description: string;
  date: string;
  isRecurring: boolean;
  tags?: string | null;
  createdAt: string;
};

type WalletDto = {
  id: string;
  name: string;
};

type CategoryDto = {
  id: string;
  name: string;
};

function toPaymentMethodId(paymentMethod?: string | null) {
  return (paymentMethod?.trim().toLowerCase().replace(/\s+/g, '-') || 'cash') as string;
}

function toPaymentMethodLabel(paymentMethodId: string) {
  return paymentMethodId
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function toTransactionItem(expense: ExpenseDto): ExpenseTransactionListItem {
  const paymentMethodId = toPaymentMethodId(expense.paymentMethod);

  return {
    id: expense.id,
    title: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    type: expense.type.toLowerCase() === 'income' ? 'income' : 'expense',
    category: expense.categoryId ?? 'uncategorized',
    walletId: expense.walletId ?? 'unassigned',
    paymentMethodId,
    date: expense.date,
    notes: expense.tags ?? undefined,
    createdAt: expense.createdAt,
    dateLabel: expense.date.slice(0, 10),
    categoryLabel: expense.categoryName ?? 'Uncategorized',
    walletLabel: expense.walletName ?? 'Unassigned',
    paymentMethodLabel: toPaymentMethodLabel(paymentMethodId),
  };
}

function buildCategoryBreakdown(summary: ExpenseSummaryResponse): ExpenseCategoryBreakdown[] {
  const max = summary.byCategory.reduce((acc, item) => Math.max(acc, item.total), 0);

  return summary.byCategory.map((item) => ({
    category: item.categoryId ?? item.categoryName.toLowerCase().replace(/\s+/g, '-'),
    label: item.categoryName,
    amount: item.total,
    percent: max > 0 ? Math.max(8, Math.round((item.total / max) * 100)) : 0,
  }));
}

function buildPaymentMethods(items: ExpenseTransactionListItem[]): PaymentMethodOption[] {
  const map = new Map<string, PaymentMethodOption>();

  for (const item of items) {
    if (!map.has(item.paymentMethodId)) {
      map.set(item.paymentMethodId, {
        id: item.paymentMethodId,
        label: item.paymentMethodLabel,
      });
    }
  }

  if (!map.size) {
    map.set('cash', { id: 'cash', label: 'Cash' });
  }

  return Array.from(map.values());
}

export const expensesApi = {
  getSnapshot: async () => {
    const [summaryResponse, transactionsResponse, walletsResponse, categoriesResponse] = await Promise.all([
      apiClient.get<ExpenseSummaryResponse>('/transactions/summary'),
      apiClient.get<PagedResult<ExpenseDto>>('/transactions', { params: { page: 1, pageSize: 100 } }),
      apiClient.get<WalletDto[]>('/wallets'),
      apiClient.get<CategoryDto[]>('/categories'),
    ]);

    const transactions = transactionsResponse.data.items.map(toTransactionItem);
    const categoryBreakdown = buildCategoryBreakdown(summaryResponse.data);
    const incomeThisMonth = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const data: ExpensesSnapshot = {
      summary: {
        spentThisMonth: summaryResponse.data.totalSpent,
        incomeThisMonth,
        transactionCount: transactionsResponse.data.total,
        topCategoryLabel: categoryBreakdown[0]?.label ?? 'No categories yet',
      },
      transactions,
      categoryBreakdown,
      categories: categoriesResponse.data.map((category) => ({
        id: category.id,
        label: category.name,
      })),
      wallets: walletsResponse.data.map((wallet) => ({
        id: wallet.id,
        label: wallet.name,
      })),
      paymentMethods: buildPaymentMethods(transactions),
    };

    return { data };
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ExpenseDto>(`/transactions/${id}`);
    return {
      data: {
        ...toTransactionItem(data),
        isRecurring: data.isRecurring,
        tags: data.tags ?? undefined,
      } satisfies ExpenseDetail,
    };
  },

  create: async (payload: CreateExpenseRequest) => {
    const { data } = await apiClient.post<{ id: string }>('/transactions', {
      categoryId: payload.category === 'uncategorized' ? null : payload.category,
      walletId: payload.walletId === 'unassigned' ? null : payload.walletId,
      amount: payload.amount,
      currency: 'MAD',
      type: payload.type,
      paymentMethod: payload.paymentMethodId,
      description: payload.title,
      notes: payload.notes ?? null,
      date: payload.date,
      isRecurring: false,
      tags: payload.notes ?? null,
    });

    return { data };
  },
};
