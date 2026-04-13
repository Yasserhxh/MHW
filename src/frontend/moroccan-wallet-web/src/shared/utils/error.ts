import type { AxiosError } from 'axios';
import type { ApiError, ProblemDetails } from '../types/api';

export function normalizeApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<ProblemDetails>;
  if (axiosError.response) {
    const data = axiosError.response.data;
    return {
      message:
        data?.detail ??
        data?.title ??
        (typeof axiosError.response.data === 'string' ? axiosError.response.data : null) ??
        axiosError.message ??
        'Request failed',
      status: axiosError.response.status,
      validation: data?.errors,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Unable to reach server. Please try again.' };
}
