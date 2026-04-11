import { AppPageHeader } from '../../../shared/components/AppPageHeader';
import { HouseholdBalanceCard } from '../../../shared/components/HouseholdBalanceCard';
import { SectionCard } from '../../../shared/components/SectionCard';
import { QuickAddButton, StatusBadge } from '../../../shared/components/common';

export default function SharedExpensesPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Shared Expenses" subtitle="Manage household costs and settlements." action={<QuickAddButton label="Add Shared Expense" />} />
      <div className="grid-2">
        <SectionCard title="Member balances">
          <div className="list">
            <HouseholdBalanceCard member="Amina" balance={340} />
            <HouseholdBalanceCard member="Youssef" balance={-120} />
            <HouseholdBalanceCard member="Sara" balance={-220} />
          </div>
        </SectionCard>
        <SectionCard title="Settlement history">
          <div className="list">
            <div className="list-item"><span>Sara → Amina</span><span>MAD 120 <StatusBadge status="settled" /></span></div>
            <div className="list-item"><span>Youssef → Amina</span><span>MAD 90 <StatusBadge status="settled" /></span></div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Shared expense list">
        <div className="list">
          <div className="list-item"><span>Rent - April</span><span>MAD 3,600</span></div>
          <div className="list-item"><span>Water bill</span><span>MAD 180</span></div>
          <div className="list-item"><span>Cleaning supplies</span><span>MAD 145</span></div>
        </div>
      </SectionCard>
    </div>
  );
}
