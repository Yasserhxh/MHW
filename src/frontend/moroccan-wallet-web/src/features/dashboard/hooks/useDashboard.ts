import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const dashboardQueryKey = ['dashboard', 'snapshot'] as const;

export function useDashboardSnapshot() {
  return useQuery({
    queryKey: dashboardQueryKey,
    queryFn: async () => {
      const { data } = await dashboardApi.getSnapshot();
      return data;
    },
  });
}
