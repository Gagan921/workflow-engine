/**
 * Workflow Engine Shared Types
 *
 * These types are shared between the backend API and frontend.
 * They define the core domain models for the workflow engine.
 */
export type WorkflowStatus = 'enabled' | 'disabled';
export type WorkflowRunStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';
export type StepType = 'filter' | 'transform' | 'http_request';
export type FilterOperator = 'eq' | 'neq';
export interface FilterCondition {
    path: string;
    op: FilterOperator;
    value: unknown;
}
export interface FilterStep {
    type: 'filter';
    conditions: FilterCondition[];
}
export type TransformOperationType = 'default' | 'template' | 'pick';
export interface TransformOperationBase {
    op: TransformOperationType;
}
export interface TransformDefaultOperation extends TransformOperationBase {
    op: 'default';
    path: string;
    value: unknown;
}
export interface TransformTemplateOperation extends TransformOperationBase {
    op: 'template';
    to: string;
    template: string;
}
export interface TransformPickOperation extends TransformOperationBase {
    op: 'pick';
    paths: string[];
}
export type TransformOperation = TransformDefaultOperation | TransformTemplateOperation | TransformPickOperation;
export interface TransformStep {
    type: 'transform';
    ops: TransformOperation[];
}
export type HttpBodyMode = 'ctx' | 'custom';
export interface HttpBodyCtx {
    mode: 'ctx';
}
export interface HttpBodyCustom {
    mode: 'custom';
    value: Record<string, unknown>;
}
export type HttpBody = HttpBodyCtx | HttpBodyCustom;
export interface HttpRequestStep {
    type: 'http_request';
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    body?: HttpBody;
    timeoutMs: number;
    retries: number;
}
export type WorkflowStep = FilterStep | TransformStep | HttpRequestStep;
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
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkflowRun {
    id: string;
    workflowId: string;
    status: WorkflowRunStatus;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
    ctx?: Record<string, unknown>;
    stepResults?: StepResult[];
}
export interface StepResult {
    stepIndex: number;
    stepType: StepType;
    status: 'success' | 'failed' | 'skipped';
    error?: string;
    durationMs: number;
}
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
export interface WorkflowResponse {
    id: string;
    name: string;
    enabled: boolean;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    createdAt: string;
    updatedAt: string;
}
export interface WorkflowRunResponse {
    id: string;
    workflowId: string;
    status: WorkflowRunStatus;
    startedAt: string;
    completedAt?: string;
    error?: string;
}
export interface TriggerWorkflowResponse {
    runId: string;
    status: WorkflowRunStatus;
    message?: string;
}
export interface ApiErrorResponse {
    error: string;
    details?: Record<string, string[]>;
}
export interface ExecutionContext {
    workflowId: string;
    runId: string;
    data: Record<string, unknown>;
}
