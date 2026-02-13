/**
 * API Client
 * 
 * HTTP client for communicating with the workflow engine backend.
 */

import { 
  Workflow, 
  WorkflowRun, 
  CreateWorkflowRequest, 
  UpdateWorkflowRequest,
  TriggerWorkflowResponse,
  ApiError 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiError extends Error {
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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({ 
      error: 'Unknown error',
      code: 'UNKNOWN_ERROR'
    }));
    
    throw new ApiError(
      errorData.error,
      response.status,
      errorData.code,
      errorData.details
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

// ============================================================================
// Workflow API
// ============================================================================

export const workflowApi = {
  /**
   * Get all workflows
   */
  getAll: async (): Promise<Workflow[]> => {
    const response = await fetchApi<{ workflows: Workflow[] }>('/workflows');
    return response.workflows;
  },

  /**
   * Get a workflow by ID
   */
  getById: async (id: string): Promise<Workflow> => {
    return fetchApi<Workflow>(`/workflows/${id}`);
  },

  /**
   * Create a new workflow
   */
  create: async (data: CreateWorkflowRequest): Promise<Workflow> => {
    return fetchApi<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a workflow
   */
  update: async (id: string, data: UpdateWorkflowRequest): Promise<Workflow> => {
    return fetchApi<Workflow>(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a workflow
   */
  delete: async (id: string): Promise<void> => {
    return fetchApi<void>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get workflow runs
   */
  getRuns: async (id: string): Promise<WorkflowRun[]> => {
    const response = await fetchApi<{ runs: WorkflowRun[] }>(`/workflows/${id}/runs`);
    return response.runs;
  },
};

// ============================================================================
// Trigger API
// ============================================================================

export const triggerApi = {
  /**
   * Trigger a workflow by its trigger path
   */
  trigger: async (path: string, data: Record<string, unknown> = {}): Promise<TriggerWorkflowResponse> => {
    return fetchApi<TriggerWorkflowResponse>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export { ApiError };