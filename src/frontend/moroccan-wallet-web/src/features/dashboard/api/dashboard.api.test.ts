import { describe, expect, it } from 'vitest';
import { dashboardApi } from './dashboard.api';

describe('dashboardApi', () => {
  it('builds a dashboard snapshot from the seeded mock database', async () => {
    const response = await dashboardApi.getSnapshot();

    expect(response.data.summary.currentMonthSpent).toBeGreaterThan(0);
    expect(response.data.summary.remainingBudget).toBeGreaterThanOrEqual(0);
    expect(response.data.recentTransactions).toHaveLength(4);
    expect(response.data.upcomingReminders.length).toBeGreaterThan(0);
    expect(response.data.sharedActivity.length).toBeGreaterThan(0);
    expect(response.data.topCategories[0]?.percent).toBeGreaterThan(0);
    expect(response.data.notifications[0]?.status).toMatch(/read|unread/);
  });
});
