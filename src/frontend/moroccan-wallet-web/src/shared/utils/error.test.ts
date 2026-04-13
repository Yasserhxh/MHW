import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { normalizeApiError } from './error';

describe('normalizeApiError', () => {
  it('prefers ProblemDetails detail and carries validation errors', () => {
    const error = new AxiosError('Request failed', '422', undefined, undefined, {
      data: {
        title: 'Validation failed',
        detail: 'One or more fields are invalid.',
        errors: {
          email: ['Email is required.'],
        },
      },
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: {} as never,
    });

    expect(normalizeApiError(error)).toEqual({
      message: 'One or more fields are invalid.',
      status: 422,
      validation: {
        email: ['Email is required.'],
      },
    });
  });

  it('falls back to the generic offline message when there is no response', () => {
    expect(normalizeApiError({})).toEqual({
      message: 'Unable to reach server. Please try again.',
    });
  });
});
