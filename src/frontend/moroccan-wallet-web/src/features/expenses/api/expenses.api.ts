import { apiClient } from '@/shared/api/client';
import { createExpenseMock, getExpensesSnapshotMock } from '../mocks/expenses.mock';
import type { CreateExpenseRequest, ExpensesSnapshot, ExpenseTransactionListItem } from '../types/expenses.types';

const MOCK_DELAY_MS = 220;

function mockResponse<T>(data: T): Promise<{ data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), MOCK_DELAY_MS);
  });
}

export const expensesApi = {
  getSnapshot: async (): Promise<{ data: ExpensesSnapshot }> => {
    // Backend target endpoints:
    // GET /api/v1/transactions
    // GET /api/v1/categories
    // GET /api/v1/wallets
    // GET /api/v1/reference/payment-methods
    void apiClient;
    return mockResponse(getExpensesSnapshotMock());
  },
  create: async (payload: CreateExpenseRequest): Promise<{ data: ExpenseTransactionListItem }> => {
    // Backend target endpoint:
    // POST /api/v1/transactions
    void apiClient;
    return mockResponse(createExpenseMock(payload));
  },
};
