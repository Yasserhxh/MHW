import { useAuthStore } from '@/features/auth/store/auth.store';
import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type {
  CreateSettlementRequest,
  CreateSharedExpenseRequest,
  CreateSharedGroupRequest,
  Settlement,
  SharedExpense,
  SharedGroupMember,
  SharedGroupOverview,
  SharedGroupSummary,
  SharedMemberBalance,
} from '../types/shared-expenses.types';

type GroupSummaryDto = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  currency: string;
  memberCount: number;
  createdAt: string;
};

type GroupDetailDto = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  currency: string;
  isActive: boolean;
  members: Array<{ userId: string; joinedAt: string }>;
};

type GroupBalancesDto = {
  groupId: string;
  groupName: string;
  currency: string;
  balances: Array<{ userId: string; paid: number; owes: number; balance: number }>;
};

type SettlementDto = {
  id: string;
  fromUserId: string;
  toUserId: string;
  recordedByUserId: string;
  amount: number;
  currency: string;
  settledOn: string;
  notes?: string | null;
  createdAt: string;
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

type SharedExpenseDetailDto = SharedExpenseDto & {
  groupId: string;
};

type CreatedGroupResponse = {
  id: string;
  name: string;
};

type CreatedSettlementResponse = {
  id: string;
};

const descriptionSeparator = '\n\n';

function toRole(userId: string, ownerId: string): 'Owner' | 'Member' {
  return userId === ownerId ? 'Owner' : 'Member';
}

function formatMemberName(userId: string, ownerId: string, currentUserId?: string | null) {
  if (userId === currentUserId) {
    return 'You';
  }

  const prefix = userId === ownerId ? 'Owner' : 'Member';
  return `${prefix} ${userId.slice(0, 8)}`;
}

function deserializeDescription(description: string) {
  const [title, ...rest] = description.split(descriptionSeparator);
  return {
    title: title.trim(),
    notes: rest.join(descriptionSeparator).trim() || undefined,
  };
}

function serializeDescription(title: string, notes?: string) {
  const trimmedTitle = title.trim();
  const trimmedNotes = notes?.trim();

  if (!trimmedNotes) {
    return trimmedTitle;
  }

  return `${trimmedTitle}${descriptionSeparator}${trimmedNotes}`;
}

function mapGroupSummary(group: GroupSummaryDto): SharedGroupSummary {
  return {
    id: group.id,
    name: group.name,
    description: group.description ?? undefined,
    ownerId: group.ownerId,
    currency: group.currency,
    memberCount: group.memberCount,
    createdAt: group.createdAt,
  };
}

function mapMembers(group: GroupDetailDto, currentUserId?: string | null): SharedGroupMember[] {
  return group.members.map((member) => ({
    userId: member.userId,
    joinedAt: member.joinedAt,
    name: formatMemberName(member.userId, group.ownerId, currentUserId),
    role: toRole(member.userId, group.ownerId),
  }));
}

function mapExpense(
  expense: SharedExpenseDto | SharedExpenseDetailDto,
  members: SharedGroupMember[],
  groupId: string
): SharedExpense {
  const description = deserializeDescription(expense.description);
  const membersById = new Map(members.map((member) => [member.userId, member]));

  return {
    id: expense.id,
    groupId,
    title: description.title,
    amount: expense.amount,
    currency: expense.currency,
    paidByUserId: expense.paidById,
    paidByName: membersById.get(expense.paidById)?.name ?? expense.paidById,
    date: expense.date.slice(0, 10),
    participantIds: expense.splits.map((split) => split.userId),
    splitType: expense.splitType.toLowerCase() === 'equal' ? 'equal' : 'custom',
    splits: expense.splits.map((split) => ({
      userId: split.userId,
      name: membersById.get(split.userId)?.name ?? split.userId,
      amount: split.amount,
      isSettled: split.isSettled,
    })),
    settled: expense.splits.every((split) => split.isSettled),
    createdAt: expense.createdAt,
    notes: description.notes,
  };
}

function mapSettlement(settlement: SettlementDto, members: SharedGroupMember[]): Settlement {
  const membersById = new Map(members.map((member) => [member.userId, member]));

  return {
    id: settlement.id,
    fromUserId: settlement.fromUserId,
    fromName: membersById.get(settlement.fromUserId)?.name ?? settlement.fromUserId,
    toUserId: settlement.toUserId,
    toName: membersById.get(settlement.toUserId)?.name ?? settlement.toUserId,
    amount: settlement.amount,
    currency: settlement.currency,
    settledAt: settlement.settledOn,
    notes: settlement.notes ?? undefined,
  };
}

function buildEqualSplits(participantIds: string[], amount: number) {
  if (!participantIds.length) {
    throw new Error('Select at least one participant before saving the shared expense.');
  }

  const normalizedAmount = Number(amount.toFixed(2));
  const baseShare = Number((normalizedAmount / participantIds.length).toFixed(2));

  return participantIds.map((userId, index) => ({
    userId,
    amount:
      index === participantIds.length - 1
        ? Number((normalizedAmount - baseShare * index).toFixed(2))
        : baseShare,
  }));
}

async function fetchGroupMembers(groupId: string) {
  const currentUserId = useAuthStore.getState().userId;
  const { data } = await apiClient.get<GroupDetailDto>(`/shared-expenses/groups/${groupId}`);
  const members = mapMembers(data, currentUserId);

  return members;
}

export const sharedExpensesApi = {
  listGroups: async () => {
    const { data } = await apiClient.get<GroupSummaryDto[]>('/shared-expenses/groups');
    return {
      data: data.map(mapGroupSummary),
    };
  },

  getGroupOverview: async (groupId: string) => {
    const { currentUserId } = {
      currentUserId: useAuthStore.getState().userId,
    };

    const [groupResponse, balancesResponse, expensesResponse, settlementsResponse] = await Promise.all([
      apiClient.get<GroupDetailDto>(`/shared-expenses/groups/${groupId}`),
      apiClient.get<GroupBalancesDto>(`/shared-expenses/groups/${groupId}/balances`),
      apiClient.get<PagedResult<SharedExpenseDto>>('/shared-expenses', {
        params: { groupId, page: 1, pageSize: 50 },
      }),
      apiClient.get<SettlementDto[]>(`/shared-expenses/groups/${groupId}/settlements`),
    ]);

    const group = groupResponse.data;
    const members = mapMembers(group, currentUserId);
    const membersById = new Map(members.map((member) => [member.userId, member]));

    const balances: SharedMemberBalance[] = balancesResponse.data.balances.map((item) => ({
      userId: item.userId,
      name: membersById.get(item.userId)?.name ?? item.userId,
      role: membersById.get(item.userId)?.role ?? 'Member',
      paid: item.paid,
      owes: item.owes,
      balance: item.balance,
    }));

    return {
      data: {
        id: group.id,
        name: group.name,
        description: group.description ?? undefined,
        ownerId: group.ownerId,
        currency: group.currency,
        isActive: group.isActive,
        members,
        balances,
        sharedExpenses: expensesResponse.data.items.map((expense) => mapExpense(expense, members, group.id)),
        settlements: settlementsResponse.data.map((settlement) => mapSettlement(settlement, members)),
        settlementHistoryAvailable: true,
      } satisfies SharedGroupOverview,
    };
  },

  getDetail: async (id: string) => {
    const { data } = await apiClient.get<SharedExpenseDetailDto>(`/shared-expenses/${id}`);
    const members = await fetchGroupMembers(data.groupId);

    return {
      data: mapExpense(data, members, data.groupId),
    };
  },

  createGroup: async (payload: CreateSharedGroupRequest) => {
    const { data } = await apiClient.post<CreatedGroupResponse>('/shared-expenses/groups', {
      name: payload.name,
      description: payload.description?.trim() || null,
      currency: payload.currency,
    });

    return { data };
  },

  addExpense: async (payload: CreateSharedExpenseRequest) => {
    const participantIds = payload.participantIds.length
      ? payload.participantIds
      : [useAuthStore.getState().userId].filter(Boolean) as string[];

    return apiClient.post('/shared-expenses', {
      groupId: payload.groupId,
      amount: payload.amount,
      currency: payload.currency,
      description: serializeDescription(payload.title, payload.notes),
      date: payload.date,
      splitType: 'equal',
      splits: buildEqualSplits(participantIds, payload.amount),
    });
  },

  createSettlement: async (payload: CreateSettlementRequest) => {
    const { data } = await apiClient.post<CreatedSettlementResponse>('/shared-expenses/settlements', payload);
    return { data };
  },
};
