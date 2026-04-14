export type TransactionType = 'expense' | 'income';

export type ExpenseCategory = string;
export type WalletId = string;
export type PaymentMethodId = string;

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

export interface ExpenseDetail extends ExpenseTransactionListItem {
  isRecurring: boolean;
  tags?: string;
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

export interface CategoryOption {
  id: ExpenseCategory;
  label: string;
  type?: TransactionType;
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
  type?: TransactionType | 'all';
  category?: ExpenseCategory | 'all';
  walletId?: WalletId | 'all';
  paymentMethodId?: PaymentMethodId | 'all';
}

export interface ExpensesSnapshot {
  summary: ExpenseSummary;
  transactions: ExpenseTransactionListItem[];
  categoryBreakdown: ExpenseCategoryBreakdown[];
  categories: CategoryOption[];
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

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  id: string;
}
