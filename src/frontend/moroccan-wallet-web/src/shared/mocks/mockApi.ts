export async function withMockLatency<T>(data: T, ms = 200): Promise<{ data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
}

export async function withMockTask<T>(task: () => T, ms = 200): Promise<{ data: T }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve({ data: task() });
      } catch (error) {
        reject(error);
      }
    }, ms);
  });
}
