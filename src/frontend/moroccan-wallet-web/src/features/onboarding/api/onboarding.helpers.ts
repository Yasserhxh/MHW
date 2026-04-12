import { withMockTask } from '@/shared/mocks/mockApi';

export function withMockApiResponse<T>(task: () => T) {
  return withMockTask(task, 180);
}

export function withMockMutation<T>(task: () => T) {
  return withMockTask(task, 220);
}
