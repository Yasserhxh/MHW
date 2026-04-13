import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { CreateSharedExpenseRequest, SharedExpense, SharedExpensesOverview } from '../types/shared-expenses.types';

type GroupSummaryDto = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  currency: string;
  memberCount: number;
  createdAt: string;
};

type GroupDetailResponse = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  currency: string;
  isActive: boolean;
  members: Array<{ userId: string; joinedAt: string }>;
};

type GroupBalancesResponse = {
  groupId: string;
  groupName: string;
  currency: string;
  balances: Array<{ userId: string; paid: number; owes: number; balance: number }>;
};

type SharedExpenseDto = {
  id: string;
  paidById: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  splitType: string;
  splits: Array<{ userId: string; amount: number; isSettled: boolean }>;
  createdAt: string;
};

type SharedExpenseDetailResponse = SharedExpenseDto & {
  groupId: string;
};

function formatMemberName(userId: string, currentUserId?: string | null) {
  if (userId === currentUserId) {
    return 'You';
  }

  return `Member ${userId.slice(0, 8)}`;
}

function toSharedExpense(item: SharedExpenseDto): SharedExpense {
  return {
    id: item.id,
    title: item.description,
    amount: item.amount,
    currency: item.currency,
    paidByMemberId: item.paidById,
    date: item.date.slice(0, 10),
    participantIds: item.splits.map((split) => split.userId),
    splitType: item.splitType.toLowerCase() === 'equal' ? 'equal' : 'custom',
    settled: item.splits.every((split) => split.isSettled),
    createdAt: item.createdAt,
  };
}

async function resolvePrimaryGroup() {
  const { data } = await apiClient.get<GroupSummaryDto[]>('/shared-expenses/groups');
  return data[0] ?? null;
}

export const sharedExpensesApi = {
  getOverview: async () => {
    const group = await resolvePrimaryGroup();
    const currentUserId = useAuthStore.getState().userId;

    if (!group) {
      return {
        data: {
          groupId: null,
          members: [],
          settlements: [],
          sharedExpenses: [],
        } satisfies SharedExpensesOverview,
      };
    }

    const [groupDetailResponse, balancesResponse, expensesResponse] = await Promise.all([
      apiClient.get<GroupDetailResponse>(`/shared-expenses/groups/${group.id}`),
      apiClient.get<GroupBalancesResponse>(`/shared-expenses/groups/${group.id}/balances`),
      apiClient.get<PagedResult<SharedExpenseDto>>('/shared-expenses', {
        params: { groupId: group.id, page: 1, pageSize: 50 },
      }),
    ]);

    const balancesMap = new Map(balancesResponse.data.balances.map((item) => [item.userId, item.balance]));

    return {
      data: {
        groupId: group.id,
        members: groupDetailResponse.data.members.map((member) => ({
          id: member.userId,
          userId: member.userId,
          name: formatMemberName(member.userId, currentUserId),
          email: '',
          balance: balancesMap.get(member.userId) ?? 0,
          role: member.userId === group.ownerId ? 'Owner' : 'Member',
        })),
        settlements: [],
        sharedExpenses: expensesResponse.data.items.map(toSharedExpense),
      } satisfies SharedExpensesOverview,
    };
  },

  getDetail: async (id: string) => {
    const { data } = await apiClient.get<SharedExpenseDetailResponse>(`/shared-expenses/${id}`);
    return { data: toSharedExpense(data) };
  },

  addExpense: async (payload: CreateSharedExpenseRequest) => {
    const group = await resolvePrimaryGroup();
    if (!group) {
      throw new Error('Create a shared group before adding expenses.');
    }

    const participantIds = payload.participantIds.length ? payload.participantIds : [payload.paidByUserId];
    const share = Number((payload.amount / participantIds.length).toFixed(2));

    return apiClient.post('/shared-expenses', {
      groupId: group.id,
      amount: payload.amount,
      currency: payload.currency ?? group.currency,
      description: payload.notes ? `${payload.title} - ${payload.notes}` : payload.title,
      date: payload.date,
      splitType: payload.splitType === 'equal' ? 'equal' : 'custom',
      splits: participantIds.map((userId, index) => ({
        userId,
        amount: index === participantIds.length - 1 ? Number((payload.amount - share * index).toFixed(2)) : share,
      })),
    });
  },
};
