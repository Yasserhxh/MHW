import { create } from 'zustand';

export type AppNotification = { id: string; title: string; createdAt: string; read: boolean };

type State = {
  items: AppNotification[];
  unreadCount: number;
  push: (n: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  seed: (items: AppNotification[]) => void;
  setUnreadCount: (count: number) => void;
};

export const useNotificationsStore = create<State>((set) => ({
  items: [],
  unreadCount: 0,
  push: (n) => set((s) => ({ items: [n, ...s.items], unreadCount: s.unreadCount + (n.read ? 0 : 1) })),
  markRead: (id) => set((s) => {
    const items = s.items.map((i) => (i.id === id ? { ...i, read: true } : i));
    return { items, unreadCount: items.filter((i) => !i.read).length };
  }),
  markAllRead: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })), unreadCount: 0 })),
  seed: (items) => set({ items, unreadCount: items.filter((i) => !i.read).length }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
