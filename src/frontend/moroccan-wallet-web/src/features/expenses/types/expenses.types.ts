export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'groceries'
  | 'transport'
  | 'utilities'
  | 'housing'
  | 'health'
  | 'salary'
  | 'education'
  | 'entertainment'
  | 'other';

export type WalletId = 'main-wallet' | 'cash' | 'joint-wallet' | 'savings-wallet';
export type PaymentMethodId = 'card' | 'bank-transfer' | 'cash' | 'wallet-transfer';

export interface ExpenseTransaction {
  id: string;
  title: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: ExpenseCategory;
  walletId: WalletId;
  paymentMethodId: PaymentMethodId;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface ExpenseTransactionListItem extends ExpenseTransaction {
  dateLabel: string;
  categoryLabel: string;
  walletLabel: string;
  paymentMethodLabel: string;
}

export interface ExpenseSummary {
  spentThisMonth: number;
  incomeThisMonth: number;
  transactionCount: number;
  topCategoryLabel: string;
}

export interface ExpenseCategoryBreakdown {
  category: ExpenseCategory;
  label: string;
  amount: number;
  percent: number;
}

export interface WalletOption {
  id: WalletId;
  label: string;
}

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
}

export interface ExpenseFilters {
  search?: string;
  dateRange?: 'this-month' | 'last-30-days' | 'last-90-days';
  category?: ExpenseCategory | 'all';
  walletId?: WalletId | 'all';
  paymentMethodId?: PaymentMethodId | 'all';
}

export interface ExpensesSnapshot {
  summary: ExpenseSummary;
  transactions: ExpenseTransactionListItem[];
  categoryBreakdown: ExpenseCategoryBreakdown[];
  wallets: WalletOption[];
  paymentMethods: PaymentMethodOption[];
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  walletId: WalletId;
  paymentMethodId: PaymentMethodId;
  date: string;
  notes?: string;
}

export const EXPENSE_CATEGORIES: Array<{ value: ExpenseCategory; label: string }> = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'housing', label: 'Housing' },
  { value: 'health', label: 'Health' },
  { value: 'salary', label: 'Salary' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];
