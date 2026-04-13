export interface HouseholdMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  balance: number;
  role: string;
}

export interface SharedExpense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidByMemberId: string;
  date: string;
  participantIds: string[];
  splitType: 'equal' | 'custom';
  settled: boolean;
  createdAt: string;
  notes?: string;
}

export interface SharedExpensesOverview {
  groupId: string | null;
  members: HouseholdMember[];
  settlements: Settlement[];
  sharedExpenses: SharedExpense[];
}

export interface CreateSharedExpenseRequest {
  title: string;
  amount: number;
  currency?: string;
  paidByUserId: string;
  date: string;
  splitType: 'equal' | 'custom';
  participantIds: string[];
  categoryId?: string;
  notes?: string;
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
