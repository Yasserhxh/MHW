import { AppPageHeader } from '../../../shared/components/AppPageHeader';
import { FilterBar, QuickAddButton } from '../../../shared/components/common';
import { SectionCard } from '../../../shared/components/SectionCard';

export default function GroceryPricesPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Grocery Prices" subtitle="Track latest and cheapest known prices." action={<QuickAddButton label="Add Price" />} />
      <FilterBar>
        <div className="grid-2">
          <input className="input" placeholder="Search product" />
          <select className="select"><option>All stores</option></select>
        </div>
      </FilterBar>
      <div className="grid-2">
        <SectionCard title="Favorite products">
          <div className="list">
            <div className="list-item"><span>Olive Oil 1L</span><span>Latest MAD 62 · Cheapest MAD 58</span></div>
            <div className="list-item"><span>Milk 1L</span><span>Latest MAD 9.8 · Cheapest MAD 8.9</span></div>
          </div>
        </SectionCard>
        <SectionCard title="Recent entries">
          <div className="list">
            <div className="list-item"><span>Eggs 12</span><span>MAD 19</span></div>
            <div className="list-item"><span>Rice 1kg</span><span>MAD 17</span></div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
