import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockTask } from '@/shared/mocks/mockApi';
import type { WalletPayload, WalletView } from '../types/wallets.types';

function toWalletView(id: string): WalletView {
  const db = getMockDb();
  const wallet = db.wallets.find((item) => item.id === id);
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  return {
    ...wallet,
    transactionCount: db.transactions.filter((tx) => tx.walletId === wallet.id).length,
  };
}

export const walletsApi = {
  list: () =>
    withMockTask(() => getMockDb().wallets.map((wallet) => toWalletView(wallet.id)), 180),
  getById: (id: string) => withMockTask(() => toWalletView(id), 180),
  save: (payload: WalletPayload, id?: string) =>
    withMockTask(() => {
      const next = updateMockDb((db) => {
        if (id) {
          return {
            ...db,
            wallets: db.wallets.map((wallet) => (wallet.id === id ? { ...wallet, ...payload } : wallet)),
          };
        }
        return {
          ...db,
          wallets: [
            ...db.wallets,
            { id: `wallet-${Date.now()}`, ...payload },
          ],
        };
      });
      const walletId = id ?? next.wallets[next.wallets.length - 1].id;
      return toWalletView(walletId);
    }, 220),
};
