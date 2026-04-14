export interface WalletView {
  id: string;
  name: string;
  type: WalletPayload['type'];
  currency: string;
  balance: number;
  color: string;
  icon: string;
  transactionCount: number;
  isArchived: boolean;
}

export interface WalletPayload {
  name: string;
  type: 'cash' | 'bank' | 'shared-household' | 'savings';
  currency: string;
  balance: number;
  color: string;
  icon: string;
}
