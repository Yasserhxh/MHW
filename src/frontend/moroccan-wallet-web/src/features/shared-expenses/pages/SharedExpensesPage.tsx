import { useEffect, useState } from 'react';
import { Home, ReceiptText } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/ui/Button';
import { formatDate } from '@/shared/utils/format';
import { normalizeApiError } from '@/shared/utils/error';
import { SharedExpenseFormDrawer } from '../components/SharedExpenseFormDrawer';
import { SharedGroupFormDrawer } from '../components/SharedGroupFormDrawer';
import { SettlementDrawer } from '../components/SettlementDrawer';
import {
  useAddSharedExpense,
  useCreateSettlement,
  useCreateSharedGroup,
  useSharedGroupOverview,
  useSharedGroups,
} from '../hooks/useSharedExpenses';
import type { SharedGroupSummary } from '../types/shared-expenses.types';

function getSelectedGroupId(groups: SharedGroupSummary[], requestedGroupId: string | null) {
  if (!groups.length) {
    return null;
  }

  if (requestedGroupId && groups.some((group) => group.id === requestedGroupId)) {
    return requestedGroupId;
  }

  return groups[0].id;
}

export default function SharedExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupsQuery = useSharedGroups();
  const selectedGroupId = getSelectedGroupId(groupsQuery.data ?? [], searchParams.get('groupId'));
  const overviewQuery = useSharedGroupOverview(selectedGroupId ?? undefined);
  const createGroup = useCreateSharedGroup();
  const addExpense = useAddSharedExpense();
  const createSettlement = useCreateSettlement();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(searchParams.get('compose') === '1');
  const [showSettlement, setShowSettlement] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [settlementError, setSettlementError] = useState('');

  useEffect(() => {
    if (!groupsQuery.data?.length || !selectedGroupId) {
      return;
    }

    if (searchParams.get('groupId') === selectedGroupId) {
      return;
    }

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('groupId', selectedGroupId);
        return next;
      },
      { replace: true }
    );
  }, [groupsQuery.data, searchParams, selectedGroupId, setSearchParams]);

  useEffect(() => {
    if (searchParams.get('compose') === '1') {
      setShowAddExpense(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showAddExpense || searchParams.get('compose') !== '1') {
      return;
    }

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('compose');
        return next;
      },
      { replace: true }
    );
  }, [searchParams, setSearchParams, showAddExpense]);

  if (groupsQuery.isLoading) {
    return <LoadingState message="Loading shared households..." />;
  }

  if (groupsQuery.isError) {
    return <ErrorState message="Could not load shared groups." onRetry={() => void groupsQuery.refetch()} />;
  }

  const groups = groupsQuery.data ?? [];

  if (!groups.length) {
    return (
      <div className="space-y-6">
        <AppPageHeader
          title="Shared expenses"
          subtitle="Track household costs, balances, and settlements with the people you share money with."
          action={<Button onClick={() => setShowCreateGroup(true)}>Create household</Button>}
        />
        <SectionCard>
          <EmptyState
            icon={Home}
            title="No shared households yet"
            description="Create your first household group to start splitting rent, groceries, and utility costs."
            action={{ label: 'Create household', onClick: () => setShowCreateGroup(true) }}
          />
        </SectionCard>
        <SharedGroupFormDrawer
          open={showCreateGroup}
          onClose={() => {
            setGroupError('');
            setShowCreateGroup(false);
          }}
          submitting={createGroup.isPending}
          errorMessage={groupError}
          onSubmit={async (values) => {
            setGroupError('');
            try {
              const created = await createGroup.mutateAsync(values);
              navigate(`/shared-expenses?groupId=${created.id}`);
            } catch (error) {
              setGroupError(normalizeApiError(error).message);
              throw error;
            }
          }}
        />
      </div>
    );
  }

  if (overviewQuery.isLoading) {
    return <LoadingState message="Loading group balances..." />;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return <ErrorState message="Could not load the selected household." onRetry={() => void overviewQuery.refetch()} />;
  }

  const overview = overviewQuery.data;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Shared expenses"
        subtitle="Keep household costs transparent and settle balances without guesswork."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateGroup(true)}>
              New household
            </Button>
            <Button
              onClick={() => {
                setExpenseError('');
                setShowAddExpense(true);
              }}
            >
              Add shared expense
            </Button>
          </div>
        }
      />

      <SectionCard title="Households">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => {
            const selected = group.id === overview.id;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => navigate(`/shared-expenses?groupId=${group.id}`)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  selected ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{group.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{group.description || 'Shared household group'}</div>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
                    {group.currency}
                  </span>
                </div>
                <div className="mt-4 text-xs text-slate-500">{group.memberCount} members / created {formatDate(group.createdAt)}</div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <SectionCard title={overview.name} action={<span className="text-sm text-slate-500">{overview.currency}</span>}>
          <div className="space-y-5">
            <div className="text-sm text-slate-500">{overview.description || 'No group description yet.'}</div>
            <div className="grid gap-4 md:grid-cols-2">
              {overview.balances.map((member) => (
                <div key={member.userId} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                    <CurrencyAmount amount={member.balance} positive={member.balance > 0} negative={member.balance < 0} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                    <div>
                      <div className="font-medium text-slate-700">Paid</div>
                      <CurrencyAmount amount={member.paid} className="mt-1" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-700">Owes</div>
                      <CurrencyAmount amount={member.owes} className="mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Members and settlements"
          action={
            <Button
              size="sm"
              variant="outline"
              disabled={overview.members.length < 2}
              onClick={() => {
                setSettlementError('');
                setShowSettlement(true);
              }}
            >
              Record settlement
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="space-y-3">
              {overview.members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                    <div className="text-sm text-slate-500">{member.role}</div>
                  </div>
                  <div className="text-xs text-slate-500">Joined {formatDate(member.joinedAt)}</div>
                </div>
              ))}
            </div>
            {overview.settlements.length ? (
              <div className="space-y-3">
                {overview.settlements.slice(0, 5).map((settlement) => (
                  <div key={settlement.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {settlement.fromName} settled with {settlement.toName}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Settled on {formatDate(settlement.settledAt)}</div>
                        {settlement.notes ? <div className="mt-2 text-sm text-slate-600">{settlement.notes}</div> : null}
                      </div>
                      <CurrencyAmount amount={settlement.amount} currency={settlement.currency} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No settlements recorded yet for this household.
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Shared expenses" action={<span className="text-sm text-slate-500">{overview.sharedExpenses.length} recorded</span>}>
        {overview.sharedExpenses.length ? (
          <div className="space-y-3">
            {overview.sharedExpenses.map((expense) => (
              <Link key={expense.id} to={`/shared-expenses/${expense.id}`} className="block rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{expense.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatDate(expense.date)} / paid by {expense.paidByName}</div>
                    <div className="mt-2 text-xs text-slate-500">{expense.splits.length} participants / {expense.settled ? 'Settled' : 'Open balance'}</div>
                  </div>
                  <CurrencyAmount amount={expense.amount} currency={expense.currency} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="No shared expenses yet"
            description="Add the first shared purchase for this household to start tracking who owes what."
            action={{ label: 'Add shared expense', onClick: () => setShowAddExpense(true) }}
          />
        )}
      </SectionCard>

      <SharedGroupFormDrawer
        open={showCreateGroup}
        onClose={() => {
          setGroupError('');
          setShowCreateGroup(false);
        }}
        submitting={createGroup.isPending}
        errorMessage={groupError}
        onSubmit={async (values) => {
          setGroupError('');
          try {
            const created = await createGroup.mutateAsync(values);
            navigate(`/shared-expenses?groupId=${created.id}`);
          } catch (error) {
            setGroupError(normalizeApiError(error).message);
            throw error;
          }
        }}
      />

      <SharedExpenseFormDrawer
        open={showAddExpense}
        group={overview}
        onClose={() => {
          setExpenseError('');
          setShowAddExpense(false);
        }}
        submitting={addExpense.isPending}
        errorMessage={expenseError}
        onSubmit={async (values) => {
          setExpenseError('');
          try {
            await addExpense.mutateAsync(values);
          } catch (error) {
            setExpenseError(normalizeApiError(error).message);
            throw error;
          }
        }}
      />

      <SettlementDrawer
        open={showSettlement}
        group={overview}
        onClose={() => {
          setSettlementError('');
          setShowSettlement(false);
        }}
        submitting={createSettlement.isPending}
        errorMessage={settlementError}
        onSubmit={async (values) => {
          setSettlementError('');
          try {
            await createSettlement.mutateAsync(values);
          } catch (error) {
            setSettlementError(normalizeApiError(error).message);
            throw error;
          }
        }}
      />
    </div>
  );
}
