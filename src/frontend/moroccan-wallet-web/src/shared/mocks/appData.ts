export type HouseholdMode = 'just-me' | 'family' | 'roommates';
export type WalletType = 'cash' | 'bank' | 'shared-household' | 'savings';
export type EntryType = 'expense' | 'income';
export type ReminderStatus = 'upcoming' | 'overdue' | 'completed' | 'snoozed';
export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type NotificationKind = 'reminder' | 'shared-expense' | 'budget-warning' | 'system' | 'price-alert';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  emailVerified: boolean;
}

export interface OnboardingProfile {
  completed: boolean;
  fullName: string;
  language: string;
  currency: string;
  timezone: string;
  monthlyBudget?: number;
  salaryDay?: number;
  householdMode: HouseholdMode;
}

export interface WalletRecord {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: number;
  color: string;
  icon: string;
  archived?: boolean;
}

export interface CategoryRecord {
  id: string;
  name: string;
  type: EntryType;
  color: string;
  icon: string;
  isDefault: boolean;
  archived?: boolean;
}

export interface TransactionRecord {
  id: string;
  type: EntryType;
  title: string;
  amount: number;
  currency: string;
  categoryId: string;
  walletId: string;
  paymentMethod: string;
  date: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: 'owner' | 'member';
  email: string;
  balance: number;
}

export interface SharedExpenseRecord {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  paidByMemberId: string;
  participantIds: string[];
  date: string;
  notes?: string;
  createdAt: string;
}

export interface SettlementRecord {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface GroceryPriceRecord {
  id: string;
  productName: string;
  storeName: string;
  price: number;
  unit: string;
  date: string;
  notes?: string;
  isFavorite: boolean;
}

export interface ReminderRecord {
  id: string;
  title: string;
  amount?: number;
  category: string;
  dueDate: string;
  recurrence: ReminderRecurrence;
  notes?: string;
  notifyByEmail: boolean;
  priority: 'low' | 'medium' | 'high';
  status: ReminderStatus;
}

export interface NotificationRecord {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface UserPreferences {
  currency: string;
  defaultWalletId: string;
  salaryDay?: number;
  dashboardCompactMode: boolean;
  householdDefaults: HouseholdMode;
  notifications: {
    reminderInApp: boolean;
    reminderEmail: boolean;
    sharedExpenseInApp: boolean;
    budgetWarningInApp: boolean;
    weeklyDigestEmail: boolean;
  };
}

export interface AppMockDb {
  currentUserId: string;
  users: AppUser[];
  onboarding: Record<string, OnboardingProfile>;
  wallets: WalletRecord[];
  categories: CategoryRecord[];
  transactions: TransactionRecord[];
  household: {
    id: string;
    name: string;
    members: HouseholdMember[];
    sharedExpenses: SharedExpenseRecord[];
    settlements: SettlementRecord[];
  };
  groceryPrices: GroceryPriceRecord[];
  reminders: ReminderRecord[];
  notifications: NotificationRecord[];
  preferences: Record<string, UserPreferences>;
}

const now = new Date('2026-04-12T10:30:00.000Z');

export const seedMockDb: AppMockDb = {
  currentUserId: 'user-1',
  users: [
    {
      id: 'user-1',
      fullName: 'Amina El Idrissi',
      email: 'amina@example.com',
      password: 'Password123!',
      emailVerified: true,
    },
  ],
  onboarding: {
    'user-1': {
      completed: true,
      fullName: 'Amina El Idrissi',
      language: 'fr-MA',
      currency: 'MAD',
      timezone: 'Africa/Casablanca',
      monthlyBudget: 7000,
      salaryDay: 28,
      householdMode: 'roommates',
    },
  },
  wallets: [
    { id: 'wallet-main', name: 'Main Bank Wallet', type: 'bank', currency: 'MAD', balance: 12450, color: 'teal', icon: 'wallet' },
    { id: 'wallet-cash', name: 'Cash', type: 'cash', currency: 'MAD', balance: 680, color: 'amber', icon: 'banknote' },
    { id: 'wallet-household', name: 'Household Shared', type: 'shared-household', currency: 'MAD', balance: 2450, color: 'blue', icon: 'users' },
    { id: 'wallet-savings', name: 'Savings Pot', type: 'savings', currency: 'MAD', balance: 8400, color: 'emerald', icon: 'piggy-bank' },
  ],
  categories: [
    { id: 'cat-groceries', name: 'Groceries', type: 'expense', color: 'emerald', icon: 'shopping-basket', isDefault: true },
    { id: 'cat-transport', name: 'Transport', type: 'expense', color: 'amber', icon: 'car', isDefault: true },
    { id: 'cat-utilities', name: 'Utilities', type: 'expense', color: 'sky', icon: 'zap', isDefault: true },
    { id: 'cat-rent', name: 'Rent', type: 'expense', color: 'rose', icon: 'home', isDefault: true },
    { id: 'cat-health', name: 'Health', type: 'expense', color: 'violet', icon: 'heart-pulse', isDefault: true },
    { id: 'cat-salary', name: 'Salary', type: 'income', color: 'teal', icon: 'banknote-arrow-down', isDefault: true },
    { id: 'cat-freelance', name: 'Freelance', type: 'income', color: 'cyan', icon: 'briefcase', isDefault: false },
    { id: 'cat-school', name: 'School', type: 'expense', color: 'indigo', icon: 'graduation-cap', isDefault: false },
  ],
  transactions: [
    { id: 'tx-1', type: 'expense', title: 'Marjane groceries', amount: 462, currency: 'MAD', categoryId: 'cat-groceries', walletId: 'wallet-main', paymentMethod: 'Card', date: '2026-04-11', notes: 'Weekly stock-up', createdAt: now.toISOString() },
    { id: 'tx-2', type: 'income', title: 'Freelance payout', amount: 2400, currency: 'MAD', categoryId: 'cat-freelance', walletId: 'wallet-main', paymentMethod: 'Bank transfer', date: '2026-04-09', notes: 'April invoice', createdAt: now.toISOString() },
    { id: 'tx-3', type: 'expense', title: 'Taxi to office', amount: 38, currency: 'MAD', categoryId: 'cat-transport', walletId: 'wallet-cash', paymentMethod: 'Cash', date: '2026-04-08', createdAt: now.toISOString() },
    { id: 'tx-4', type: 'expense', title: 'Internet bill', amount: 349, currency: 'MAD', categoryId: 'cat-utilities', walletId: 'wallet-household', paymentMethod: 'Bank transfer', date: '2026-04-05', notes: 'Fiber monthly bill', createdAt: now.toISOString() },
    { id: 'tx-5', type: 'expense', title: 'Pharmacy essentials', amount: 192, currency: 'MAD', categoryId: 'cat-health', walletId: 'wallet-main', paymentMethod: 'Card', date: '2026-04-03', createdAt: now.toISOString() },
    { id: 'tx-6', type: 'expense', title: 'Rent contribution', amount: 1800, currency: 'MAD', categoryId: 'cat-rent', walletId: 'wallet-main', paymentMethod: 'Bank transfer', date: '2026-04-01', createdAt: now.toISOString() },
    { id: 'tx-7', type: 'expense', title: 'Coffee beans', amount: 96, currency: 'MAD', categoryId: 'cat-groceries', walletId: 'wallet-main', paymentMethod: 'Card', date: '2026-03-29', createdAt: now.toISOString() },
    { id: 'tx-8', type: 'income', title: 'Salary - April', amount: 9400, currency: 'MAD', categoryId: 'cat-salary', walletId: 'wallet-main', paymentMethod: 'Bank transfer', date: '2026-03-28', createdAt: now.toISOString() },
    { id: 'tx-9', type: 'expense', title: 'Train tickets', amount: 154, currency: 'MAD', categoryId: 'cat-transport', walletId: 'wallet-main', paymentMethod: 'Card', date: '2026-03-27', createdAt: now.toISOString() },
    { id: 'tx-10', type: 'expense', title: 'Household cleaning', amount: 145, currency: 'MAD', categoryId: 'cat-groceries', walletId: 'wallet-household', paymentMethod: 'Wallet transfer', date: '2026-03-24', createdAt: now.toISOString() },
    { id: 'tx-11', type: 'expense', title: 'Doctor checkup', amount: 300, currency: 'MAD', categoryId: 'cat-health', walletId: 'wallet-main', paymentMethod: 'Card', date: '2026-03-22', createdAt: now.toISOString() },
    { id: 'tx-12', type: 'expense', title: 'Water refill', amount: 48, currency: 'MAD', categoryId: 'cat-groceries', walletId: 'wallet-cash', paymentMethod: 'Cash', date: '2026-03-21', createdAt: now.toISOString() },
    { id: 'tx-13', type: 'expense', title: 'Electricity top-up', amount: 410, currency: 'MAD', categoryId: 'cat-utilities', walletId: 'wallet-main', paymentMethod: 'Card', date: '2026-03-18', createdAt: now.toISOString() },
    { id: 'tx-14', type: 'expense', title: 'School supplies', amount: 260, currency: 'MAD', categoryId: 'cat-school', walletId: 'wallet-main', paymentMethod: 'Card', date: '2026-03-16', createdAt: now.toISOString() },
    { id: 'tx-15', type: 'income', title: 'Savings transfer in', amount: 1000, currency: 'MAD', categoryId: 'cat-salary', walletId: 'wallet-savings', paymentMethod: 'Wallet transfer', date: '2026-03-12', createdAt: now.toISOString() },
    { id: 'tx-16', type: 'expense', title: 'Late dinner with roommates', amount: 175, currency: 'MAD', categoryId: 'cat-groceries', walletId: 'wallet-household', paymentMethod: 'Card', date: '2026-03-11', createdAt: now.toISOString() },
    { id: 'tx-17', type: 'expense', title: 'Bus card refill', amount: 80, currency: 'MAD', categoryId: 'cat-transport', walletId: 'wallet-cash', paymentMethod: 'Cash', date: '2026-03-08', createdAt: now.toISOString() },
    { id: 'tx-18', type: 'expense', title: 'Repair supplies', amount: 210, currency: 'MAD', categoryId: 'cat-utilities', walletId: 'wallet-household', paymentMethod: 'Card', date: '2026-03-04', createdAt: now.toISOString() },
    { id: 'tx-19', type: 'expense', title: 'Weekend market', amount: 330, currency: 'MAD', categoryId: 'cat-groceries', walletId: 'wallet-main', paymentMethod: 'Cash', date: '2026-03-02', createdAt: now.toISOString() },
    { id: 'tx-20', type: 'expense', title: 'Apartment internet setup', amount: 520, currency: 'MAD', categoryId: 'cat-utilities', walletId: 'wallet-household', paymentMethod: 'Bank transfer', date: '2026-02-28', createdAt: now.toISOString() },
  ],
  household: {
    id: 'household-1',
    name: 'Casablanca Flat',
    members: [
      { id: 'member-1', name: 'Amina', role: 'owner', email: 'amina@example.com', balance: 340 },
      { id: 'member-2', name: 'Youssef', role: 'member', email: 'youssef@example.com', balance: -120 },
      { id: 'member-3', name: 'Sara', role: 'member', email: 'sara@example.com', balance: -220 },
    ],
    sharedExpenses: [
      { id: 'se-1', title: 'April Rent', amount: 3600, categoryId: 'cat-rent', paidByMemberId: 'member-1', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-04-01', notes: 'Monthly rent', createdAt: now.toISOString() },
      { id: 'se-2', title: 'Water bill', amount: 180, categoryId: 'cat-utilities', paidByMemberId: 'member-2', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-04-10', createdAt: now.toISOString() },
      { id: 'se-3', title: 'Cleaning supplies', amount: 145, categoryId: 'cat-groceries', paidByMemberId: 'member-1', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-04-07', createdAt: now.toISOString() },
      { id: 'se-4', title: 'Shared groceries', amount: 395, categoryId: 'cat-groceries', paidByMemberId: 'member-3', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-04-03', createdAt: now.toISOString() },
      { id: 'se-5', title: 'Wi-Fi router replacement', amount: 620, categoryId: 'cat-utilities', paidByMemberId: 'member-1', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-03-28', createdAt: now.toISOString() },
      { id: 'se-6', title: 'Cooking gas refill', amount: 95, categoryId: 'cat-groceries', paidByMemberId: 'member-2', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-03-24', createdAt: now.toISOString() },
      { id: 'se-7', title: 'Electricity bill', amount: 410, categoryId: 'cat-utilities', paidByMemberId: 'member-1', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-03-19', createdAt: now.toISOString() },
      { id: 'se-8', title: 'Market haul', amount: 290, categoryId: 'cat-groceries', paidByMemberId: 'member-3', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-03-15', createdAt: now.toISOString() },
      { id: 'se-9', title: 'Kitchen repair', amount: 450, categoryId: 'cat-utilities', paidByMemberId: 'member-1', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-03-10', createdAt: now.toISOString() },
      { id: 'se-10', title: 'Household snacks', amount: 120, categoryId: 'cat-groceries', paidByMemberId: 'member-2', participantIds: ['member-1', 'member-2', 'member-3'], date: '2026-03-06', createdAt: now.toISOString() },
    ],
    settlements: [
      { id: 'st-1', fromMemberId: 'member-3', toMemberId: 'member-1', amount: 120, date: '2026-04-05', note: 'Groceries split' },
      { id: 'st-2', fromMemberId: 'member-2', toMemberId: 'member-1', amount: 90, date: '2026-03-22', note: 'Electricity share' },
    ],
  },
  groceryPrices: [
    { id: 'gp-1', productName: 'Olive oil 1L', storeName: 'Marjane', price: 62, unit: '1L', date: '2026-04-11', notes: 'Promo shelf', isFavorite: true },
    { id: 'gp-2', productName: 'Eggs', storeName: 'Carrefour', price: 18.5, unit: '12 pcs', date: '2026-04-10', isFavorite: true },
    { id: 'gp-3', productName: 'Tomatoes', storeName: 'Local market', price: 8.2, unit: 'kg', date: '2026-04-09', isFavorite: false },
    { id: 'gp-4', productName: 'Milk', storeName: 'BIM', price: 9.4, unit: '1L', date: '2026-04-08', isFavorite: true },
    { id: 'gp-5', productName: 'Rice', storeName: 'Atacadao', price: 17, unit: '1kg', date: '2026-04-07', isFavorite: false },
    { id: 'gp-6', productName: 'Chicken breast', storeName: 'Local butcher', price: 58, unit: 'kg', date: '2026-04-06', isFavorite: false },
    { id: 'gp-7', productName: 'Butter', storeName: 'Carrefour', price: 22.5, unit: '250g', date: '2026-04-05', isFavorite: false },
    { id: 'gp-8', productName: 'Coffee beans', storeName: 'Marjane', price: 96, unit: '500g', date: '2026-04-04', isFavorite: true },
    { id: 'gp-9', productName: 'Sugar', storeName: 'BIM', price: 7.9, unit: '1kg', date: '2026-04-03', isFavorite: false },
    { id: 'gp-10', productName: 'Potatoes', storeName: 'Local market', price: 5.2, unit: 'kg', date: '2026-04-02', isFavorite: false },
  ],
  reminders: [
    { id: 'r-1', title: 'Internet bill', amount: 349, category: 'internet', dueDate: '2026-04-14', recurrence: 'monthly', notes: 'Fiber plan', notifyByEmail: true, priority: 'high', status: 'upcoming' },
    { id: 'r-2', title: 'Rent transfer', amount: 1800, category: 'rent', dueDate: '2026-04-01', recurrence: 'monthly', notifyByEmail: true, priority: 'high', status: 'completed' },
    { id: 'r-3', title: 'Electricity bill', amount: 410, category: 'electricity', dueDate: '2026-04-12', recurrence: 'monthly', notifyByEmail: true, priority: 'high', status: 'overdue' },
    { id: 'r-4', title: 'Water bill', amount: 180, category: 'water', dueDate: '2026-04-17', recurrence: 'monthly', notifyByEmail: false, priority: 'medium', status: 'upcoming' },
    { id: 'r-5', title: 'Mom medicine refill', amount: 120, category: 'custom', dueDate: '2026-04-13', recurrence: 'weekly', notifyByEmail: false, priority: 'medium', status: 'upcoming' },
    { id: 'r-6', title: 'Insurance renewal', amount: 900, category: 'insurance', dueDate: '2026-04-20', recurrence: 'monthly', notifyByEmail: true, priority: 'medium', status: 'snoozed' },
    { id: 'r-7', title: 'School fees', amount: 650, category: 'school', dueDate: '2026-03-28', recurrence: 'monthly', notifyByEmail: true, priority: 'high', status: 'completed' },
    { id: 'r-8', title: 'Weekly market prep', category: 'grocery', dueDate: '2026-04-15', recurrence: 'weekly', notifyByEmail: false, priority: 'low', status: 'upcoming' },
    { id: 'r-9', title: 'Phone recharge', amount: 50, category: 'custom', dueDate: '2026-04-09', recurrence: 'monthly', notifyByEmail: false, priority: 'low', status: 'overdue' },
    { id: 'r-10', title: 'Savings transfer', amount: 1000, category: 'custom', dueDate: '2026-04-28', recurrence: 'monthly', notifyByEmail: false, priority: 'medium', status: 'upcoming' },
  ],
  notifications: [
    { id: 'n-1', kind: 'reminder', title: 'Reminder due soon', message: 'Internet bill is due in 2 days.', createdAt: '2026-04-12T08:00:00Z', isRead: false, actionUrl: '/reminders/r-1' },
    { id: 'n-2', kind: 'shared-expense', title: 'Shared expense added', message: 'Water bill was added to Casablanca Flat.', createdAt: '2026-04-11T19:00:00Z', isRead: false, actionUrl: '/shared-expenses/se-2' },
    { id: 'n-3', kind: 'budget-warning', title: 'Budget check-in', message: 'You have used 70% of your monthly budget.', createdAt: '2026-04-10T12:00:00Z', isRead: false, actionUrl: '/dashboard' },
    { id: 'n-4', kind: 'price-alert', title: 'Favorite price dropped', message: 'Olive oil is down to MAD 62 at Marjane.', createdAt: '2026-04-09T17:30:00Z', isRead: true, actionUrl: '/grocery-prices/gp-1' },
    { id: 'n-5', kind: 'system', title: 'Verification complete', message: 'Your email has been verified successfully.', createdAt: '2026-04-09T09:00:00Z', isRead: true, actionUrl: '/settings/profile' },
    { id: 'n-6', kind: 'reminder', title: 'Reminder snoozed', message: 'Insurance renewal was snoozed by 3 days.', createdAt: '2026-04-08T15:00:00Z', isRead: true, actionUrl: '/reminders/r-6' },
    { id: 'n-7', kind: 'shared-expense', title: 'Settlement received', message: 'Sara settled MAD 120 for groceries.', createdAt: '2026-04-05T18:00:00Z', isRead: true, actionUrl: '/shared-expenses' },
    { id: 'n-8', kind: 'system', title: 'New month ready', message: 'Your April dashboard snapshot is ready.', createdAt: '2026-04-01T07:00:00Z', isRead: true, actionUrl: '/dashboard' },
    { id: 'n-9', kind: 'price-alert', title: 'Milk price updated', message: 'Milk is now MAD 9.4 at BIM.', createdAt: '2026-04-08T09:00:00Z', isRead: false, actionUrl: '/grocery-prices' },
    { id: 'n-10', kind: 'reminder', title: 'Overdue reminder', message: 'Phone recharge is overdue.', createdAt: '2026-04-10T07:40:00Z', isRead: false, actionUrl: '/reminders/r-9' },
    { id: 'n-11', kind: 'budget-warning', title: 'Groceries rising', message: 'Groceries are your top spending category this month.', createdAt: '2026-04-07T13:00:00Z', isRead: true, actionUrl: '/expenses' },
    { id: 'n-12', kind: 'shared-expense', title: 'Rent logged', message: 'April rent was logged to the household group.', createdAt: '2026-04-01T10:00:00Z', isRead: true, actionUrl: '/shared-expenses/se-1' },
    { id: 'n-13', kind: 'system', title: 'Password changed', message: 'Your password was updated recently.', createdAt: '2026-03-29T09:20:00Z', isRead: true, actionUrl: '/settings/security' },
    { id: 'n-14', kind: 'price-alert', title: 'Eggs tracked', message: 'New eggs price entry added at Carrefour.', createdAt: '2026-04-10T10:40:00Z', isRead: false, actionUrl: '/grocery-prices/gp-2' },
    { id: 'n-15', kind: 'reminder', title: 'Upcoming market prep', message: 'Weekly market prep reminder is in 3 days.', createdAt: '2026-04-12T09:10:00Z', isRead: false, actionUrl: '/reminders/r-8' },
  ],
  preferences: {
    'user-1': {
      currency: 'MAD',
      defaultWalletId: 'wallet-main',
      salaryDay: 28,
      dashboardCompactMode: false,
      householdDefaults: 'roommates',
      notifications: {
        reminderInApp: true,
        reminderEmail: true,
        sharedExpenseInApp: true,
        budgetWarningInApp: true,
        weeklyDigestEmail: false,
      },
    },
  },
};
