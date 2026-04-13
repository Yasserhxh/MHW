import { z } from 'zod';

export const expenseFormSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  type: z.enum(['expense', 'income']),
  category: z.string().min(1, 'Category is required'),
  walletId: z.string().min(1, 'Wallet is required'),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(240, 'Notes must stay under 240 characters').optional().or(z.literal('')),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
