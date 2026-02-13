/**
 * API Internal Types
 * 
 * Types specific to the API layer that don't need to be shared with the frontend.
 */

import { Request, Response, NextFunction } from 'express';
import { WorkflowStep, WorkflowRunStatus } from '@workflow/shared-types';

// ============================================================================
// Express Extensions
// ============================================================================

export interface AuthenticatedRequest extends Request {
  // Add authentication fields here if needed in the future
  user?: {
    id: string;
    email: string;
  };
}

export type ApiRequest = AuthenticatedRequest;

export type ApiResponse = Response;

export type ApiNextFunction = NextFunction;

// ============================================================================
// Service Layer Types
// ============================================================================

export interface ExecuteWorkflowInput {
  workflowId: string;
  triggerData: Record<string, unknown>;
}

export interface ExecuteWorkflowOutput {
  runId: string;
  status: WorkflowRunStatus;
  error?: string;
}

export interface StepExecutionContext {
  workflowId: string;
  runId: string;
  stepIndex: number;
  data: Record<string, unknown>;
}

export interface StepExecutionResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  data: Record<string, unknown>;
}

export interface StepExecutor {
  execute(step: WorkflowStep, ctx: StepExecutionContext): Promise<StepExecutionResult>;
}

// ============================================================================
// HTTP Request Step Types
// ============================================================================

export interface HttpRequestConfig {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  timeoutMs: number;
  retries: number;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

// ============================================================================
// Error Types
// ============================================================================

export class WorkflowError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'WorkflowError';
    Object.setPrototypeOf(this, WorkflowError.prototype);
  }
}

export class ValidationError extends WorkflowError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends WorkflowError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class WorkflowDisabledError extends WorkflowError {
  constructor(workflowId: string) {
    super(`Workflow '${workflowId}' is disabled`, 'WORKFLOW_DISABLED', 403);
    this.name = 'WorkflowDisabledError';
    Object.setPrototypeOf(this, WorkflowDisabledError.prototype);
  }
}