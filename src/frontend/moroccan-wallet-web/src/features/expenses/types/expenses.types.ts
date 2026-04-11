export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'housing'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'clothing'
  | 'savings'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CreateExpenseRequest {
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'housing', label: 'Housing' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'savings', label: 'Savings' },
  { value: 'other', label: 'Other' },
];
