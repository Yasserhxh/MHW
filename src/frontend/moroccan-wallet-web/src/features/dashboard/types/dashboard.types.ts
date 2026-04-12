export interface DashboardSummary {
  currentMonthSpent: number;
  remainingBudget: number;
  upcomingItemsCount: number;
  householdBalance: number;
  monthBudget: number;
}

export interface DashboardRecentTransaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'paid' | 'upcoming' | 'overdue';
}

export interface DashboardReminderPreview {
  id: string;
  title: string;
  dueDate: string;
  status: 'upcoming' | 'overdue' | 'today' | 'completed';
}

export interface DashboardSharedActivity {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  createdAt: string;
}

export interface DashboardCategoryTotal {
  id: string;
  label: string;
  amount: number;
  percent: number;
}

export interface DashboardPricePreview {
  id: string;
  productName: string;
  latestPrice: number;
  previousPrice: number;
  storeName: string;
  updatedAt: string;
}

export interface DashboardNotificationPreview {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read';
}

export interface DashboardSnapshot {
  summary: DashboardSummary;
  recentTransactions: DashboardRecentTransaction[];
  upcomingReminders: DashboardReminderPreview[];
  sharedActivity: DashboardSharedActivity[];
  topCategories: DashboardCategoryTotal[];
  groceryPrices: DashboardPricePreview[];
  notifications: DashboardNotificationPreview[];
}
