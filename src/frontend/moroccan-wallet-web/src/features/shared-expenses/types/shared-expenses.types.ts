export interface HouseholdMember {
  userId: string;
  name: string;
  email: string;
  balance: number; // positive = owed money, negative = owes money
}

export interface SharedExpense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  paidByName: string;
  date: string;
  splitType: 'equal' | 'custom';
  participants: { userId: string; name: string; share: number }[];
  settled: boolean;
  createdAt: string;
}

export interface CreateSharedExpenseRequest {
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  date: string;
  splitType: 'equal' | 'custom';
  participantIds: string[];
}

export interface Settlement {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
  currency: string;
  settledAt: string;
}
