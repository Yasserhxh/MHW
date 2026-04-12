import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  Tags,
  Users,
  ShoppingCart,
  AlarmClock,
  Bell,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Wallets', href: '/wallets', icon: WalletCards },
  { label: 'Categories', href: '/categories', icon: Tags },
  { label: 'Shared Expenses', href: '/shared-expenses', icon: Users },
  { label: 'Grocery Prices', href: '/grocery-prices', icon: ShoppingCart },
  { label: 'Reminders', href: '/reminders', icon: AlarmClock },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

export const settingsNav: NavItem = {
  label: 'Settings',
  href: '/settings/profile',
  icon: Settings,
};
