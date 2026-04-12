import { describe, expect, it } from 'vitest';
import { walletsApi } from './wallets.api';

describe('walletsApi', () => {
  it('lists wallets with transaction counts', async () => {
    const response = await walletsApi.list();

    expect(response.data.length).toBeGreaterThanOrEqual(3);
    expect(response.data[0]).toHaveProperty('transactionCount');
  });

  it('returns a wallet by id', async () => {
    const response = await walletsApi.getById('wallet-main');

    expect(response.data.name).toBe('Main Bank Wallet');
    expect(response.data.transactionCount).toBeGreaterThan(0);
  });

  it('creates and updates a wallet', async () => {
    const created = await walletsApi.save({
      name: 'Travel Cash',
      type: 'cash',
      currency: 'MAD',
      balance: 500,
      color: 'orange',
      icon: 'wallet',
    });

    expect(created.data.name).toBe('Travel Cash');

    const updated = await walletsApi.save(
      {
        name: 'Travel Cash Updated',
        type: 'cash',
        currency: 'MAD',
        balance: 650,
        color: 'orange',
        icon: 'wallet',
      },
      created.data.id
    );

    expect(updated.data.name).toBe('Travel Cash Updated');
    expect(updated.data.balance).toBe(650);
  });
});
