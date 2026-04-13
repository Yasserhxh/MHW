export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
};

export type ApiError = {
  message: string;
  status?: number;
  validation?: Record<string, string[]>;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
