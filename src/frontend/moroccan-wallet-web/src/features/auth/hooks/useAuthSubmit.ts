import { useState } from 'react';
import { normalizeApiError } from '../../../shared/utils/error';

export function useAuthSubmit<T>(submit: (payload: T) => Promise<unknown>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const run = async (payload: T, successMessage?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await submit(payload);
      if (successMessage) setSuccess(successMessage);
      return true;
    } catch (e) {
      setError(normalizeApiError(e).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, run };
}
