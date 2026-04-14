import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post, put } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
    post,
    put,
  },
}));

import { walletsApi } from './wallets.api';

describe('walletsApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
  });

  it('loads wallets with the includeArchived flag when requested', async () => {
    get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: { items: [], total: 0, page: 1, pageSize: 100 } });

    await walletsApi.list(true);

    expect(get).toHaveBeenCalledWith('/wallets', { params: { includeArchived: true } });
  });

  it('archives a wallet through the existing update contract', async () => {
    await walletsApi.archive({
      id: 'wallet-1',
      name: 'Main Bank Wallet',
      type: 'shared-household',
      currency: 'MAD',
      balance: 1200,
      color: 'teal',
      icon: 'wallet',
      transactionCount: 5,
      isArchived: false,
    });

    expect(put).toHaveBeenCalledWith('/wallets/wallet-1', {
      name: 'Main Bank Wallet',
      type: 'sharedHousehold',
      currency: 'MAD',
      currentBalance: 1200,
      color: 'teal',
      icon: 'wallet',
      isArchived: true,
    });
  });
});
