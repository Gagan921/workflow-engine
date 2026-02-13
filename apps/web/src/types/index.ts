/**
 * Frontend Types
 * 
 * TypeScript types for the workflow engine frontend.
 */

// ============================================================================
// Workflow Types
// ============================================================================

export type WorkflowStatus = 'enabled' | 'disabled';

export type WorkflowRunStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export type StepType = 'filter' | 'transform' | 'http_request';

export type FilterOperator = 'eq' | 'neq';

// ============================================================================
// Step Types
// ============================================================================

export interface FilterCondition {
  path: string;
  op: FilterOperator;
  value: unknown;
}

export interface FilterStep {
  type: 'filter';
  conditions: FilterCondition[];
}

export type TransformOperation = 
  | { op: 'default'; path: string; value: unknown }
  | { op: 'template'; to: string; template: string }
  | { op: 'pick'; paths: string[] };

export interface TransformStep {
  type: 'transform';
  ops: TransformOperation[];
}

export interface HttpRequestStep {
  type: 'http_request';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  body?: {
    mode: 'ctx' | 'custom';
    value?: Record<string, unknown>;
  };
  timeoutMs: number;
  retries: number;
}

export type WorkflowStep = FilterStep | TransformStep | HttpRequestStep;

// ============================================================================
// Workflow Model
// ============================================================================

export interface HttpTrigger {
  type: 'http';
  path: string;
}

export type WorkflowTrigger = HttpTrigger;

export interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Workflow Run
// ============================================================================

export interface StepResult {
  stepIndex: number;
  stepType: StepType;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  durationMs: number;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowRunStatus;
  startedAt: string;
  completedAt?: string;
  error?: string;
  ctx?: Record<string, unknown>;
  stepResults?: StepResult[];
}

// ============================================================================
// API Types
// ============================================================================

export interface CreateWorkflowRequest {
  name: string;
  enabled?: boolean;
  steps: WorkflowStep[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  enabled?: boolean;
  steps?: WorkflowStep[];
}

export interface TriggerWorkflowResponse {
  runId: string;
  status: WorkflowRunStatus;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}