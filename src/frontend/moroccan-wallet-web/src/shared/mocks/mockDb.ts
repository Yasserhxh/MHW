import type { AppMockDb } from './appData';
import { seedMockDb } from './appData';

const STORAGE_KEY = 'mhw-mock-db';

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedMockDb)) as AppMockDb;
}

export function getMockDb(): AppMockDb {
  if (typeof window === 'undefined') {
    return cloneSeed();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seeded = cloneSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(stored) as AppMockDb;
  } catch {
    const seeded = cloneSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function setMockDb(nextDb: AppMockDb) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDb));
  }
}

export function updateMockDb(mutator: (current: AppMockDb) => AppMockDb) {
  const current = getMockDb();
  const next = mutator(current);
  setMockDb(next);
  return next;
}

export function resetMockDb() {
  const seeded = cloneSeed();
  setMockDb(seeded);
  return seeded;
}
