import { z } from 'zod';

export const expenseFormSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  type: z.enum(['expense', 'income']),
  category: z.enum(['groceries', 'transport', 'utilities', 'housing', 'health', 'salary', 'education', 'entertainment', 'other']),
  walletId: z.enum(['main-wallet', 'cash', 'joint-wallet', 'savings-wallet']),
  paymentMethodId: z.enum(['card', 'bank-transfer', 'cash', 'wallet-transfer']),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(240, 'Notes must stay under 240 characters').optional().or(z.literal('')),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
