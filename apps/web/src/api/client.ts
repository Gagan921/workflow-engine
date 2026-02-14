/**
 * API Client
 *
 * HTTP client for communicating with the workflow engine backend.
 */

import type {
  Workflow,
  WorkflowRun,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  TriggerWorkflowResponse,
} from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Runtime API Error Class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic request handler
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.headers && typeof options.headers === 'object') {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Unknown error',
      code: 'UNKNOWN_ERROR',
    }));

    throw new ApiError(
      errorData.message || errorData.error || 'Request failed',
      response.status,
      errorData.code,
      errorData.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Workflow APIs
 */

export const workflowApi = {
  getAll: async (): Promise<Workflow[]> => {
    const data = await request<{ workflows: Workflow[] } | Workflow[]>(
      '/workflows'
    );

    return Array.isArray(data) ? data: data.workflows ?? [];
  },
  get: (id: string) =>
    request<Workflow>(`/workflows/${id}`),

  create: (data: CreateWorkflowRequest) =>
    request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateWorkflowRequest) =>
    request<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/workflows/${id}`, {
      method: 'DELETE',
    }),

  getRuns: (workflowId: string) =>
    request<{ runs: WorkflowRun[] }>(`/workflows/${workflowId}/runs`),
};

export const triggerApi = {
  trigger: (triggerPath: string, payload: Record<string, unknown>) =>
    request<TriggerWorkflowResponse>(triggerPath, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
