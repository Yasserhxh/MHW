import { AppPageHeader } from '../../../shared/components/AppPageHeader';

export default function NewExpensePage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="New expense" subtitle="Quickly add a transaction." />
      <form className="card form-grid">
        <input className="input" placeholder="Title" />
        <input className="input" placeholder="Amount (MAD)" />
        <select className="select"><option>Category</option></select>
        <input className="input" type="date" />
        <button className="btn btn-primary" type="button">Save expense</button>
      </form>
    </div>
  );
}
