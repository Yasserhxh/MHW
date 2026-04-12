import { apiClient } from '@/shared/api/client';
import { dashboardSnapshotMock } from '../mocks/dashboard.mock';
import type { DashboardSnapshot } from '../types/dashboard.types';

const MOCK_DELAY_MS = 180;

function mockResponse<T>(data: T): Promise<{ data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), MOCK_DELAY_MS);
  });
}

export const dashboardApi = {
  getSnapshot: async (): Promise<{ data: DashboardSnapshot }> => {
    // Real API shape when backend is ready:
    // const [summary, recentTransactions, upcomingReminders, notifications] = await Promise.all([
    //   apiClient.get<DashboardSummary>('/dashboard/summary'),
    //   apiClient.get<DashboardRecentTransaction[]>('/dashboard/recent-transactions'),
    //   apiClient.get<DashboardReminderPreview[]>('/dashboard/upcoming-reminders'),
    //   apiClient.get<DashboardNotificationPreview[]>('/dashboard/notifications-preview'),
    // ]);
    void apiClient;
    return mockResponse(dashboardSnapshotMock);
  },
};
