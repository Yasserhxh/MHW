import type { AxiosError } from 'axios';
import type { ApiError, ProblemDetails } from '../types/api';

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { message: error.message };
  }

  const axiosError = error as AxiosError<ProblemDetails>;
  if (axiosError.response) {
    return {
      message: axiosError.response.data?.detail ?? axiosError.response.data?.title ?? 'Request failed',
      status: axiosError.response.status,
      validation: axiosError.response.data?.errors,
    };
  }

  return { message: 'Unable to reach server. Please try again.' };
}
