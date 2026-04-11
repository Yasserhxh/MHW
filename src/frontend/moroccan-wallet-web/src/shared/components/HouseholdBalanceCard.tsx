import { CurrencyAmount } from './common';

export function HouseholdBalanceCard({ member, balance }: { member: string; balance: number }) {
  const tone = balance >= 0 ? 'success' : 'danger';
  return (
    <div className="list-item">
      <strong>{member}</strong>
      <span className={`badge badge-${tone}`}><CurrencyAmount amount={balance} /></span>
    </div>
  );
}
