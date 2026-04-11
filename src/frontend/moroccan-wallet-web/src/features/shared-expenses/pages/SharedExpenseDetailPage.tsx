import { AppPageHeader } from '../../../shared/components/AppPageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';

export default function SharedExpenseDetailPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Shared Expense Detail" subtitle="Split details and settlement status." />
      <SectionCard title="Participants">
        <div className="list-item"><span>Amina</span><strong>Paid MAD 180</strong></div>
      </SectionCard>
    </div>
  );
}
