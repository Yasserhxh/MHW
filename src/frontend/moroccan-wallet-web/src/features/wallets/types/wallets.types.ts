export interface WalletView {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  color: string;
  icon: string;
  transactionCount: number;
}

export interface WalletPayload {
  name: string;
  type: 'cash' | 'bank' | 'shared-household' | 'savings';
  currency: string;
  balance: number;
  color: string;
  icon: string;
}
