export interface SharedGroupSummary {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  currency: string;
  memberCount: number;
  createdAt: string;
}

export interface SharedGroupMember {
  userId: string;
  joinedAt: string;
  name: string;
  role: 'Owner' | 'Member';
}

export interface SharedMemberBalance {
  userId: string;
  name: string;
  role: 'Owner' | 'Member';
  paid: number;
  owes: number;
  balance: number;
}

export interface SharedGroupOverview {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  currency: string;
  isActive: boolean;
  members: SharedGroupMember[];
  balances: SharedMemberBalance[];
  sharedExpenses: SharedExpense[];
  settlements: Settlement[];
  settlementHistoryAvailable: boolean;
}

export interface SharedExpenseSplit {
  userId: string;
  name: string;
  amount: number;
  isSettled: boolean;
}

export interface SharedExpense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  paidByName: string;
  date: string;
  participantIds: string[];
  splitType: 'equal' | 'custom';
  splits: SharedExpenseSplit[];
  settled: boolean;
  createdAt: string;
  notes?: string;
}

export interface CreateSharedExpenseRequest {
  groupId: string;
  title: string;
  amount: number;
  currency?: string;
  date: string;
  participantIds: string[];
  notes?: string;
}

export interface CreateSharedGroupRequest {
  name: string;
  description?: string;
  currency: string;
}

export interface CreateSettlementRequest {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  settledOn: string;
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
  notes?: string;
}
