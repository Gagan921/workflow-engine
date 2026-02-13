/**
 * Validation Schemas
 * 
 * Zod schemas for validating workflow definitions and API requests.
 */

import { z } from 'zod';

// ============================================================================
// Filter Step Validation
// ============================================================================

export const filterOperatorSchema = z.enum(['eq', 'neq']);

export const filterConditionSchema = z.object({
  path: z.string().min(1, 'Path is required'),
  op: filterOperatorSchema,
  value: z.unknown(),
});

export const filterStepSchema = z.object({
  type: z.literal('filter'),
  conditions: z.array(filterConditionSchema).min(1, 'At least one condition is required'),
});

// ============================================================================
// Transform Step Validation
// ============================================================================

export const transformDefaultOperationSchema = z.object({
  op: z.literal('default'),
  path: z.string().min(1, 'Path is required'),
  value: z.unknown(),
});

export const transformTemplateOperationSchema = z.object({
  op: z.literal('template'),
  to: z.string().min(1, 'Target field is required'),
  template: z.string().min(1, 'Template is required'),
});

export const transformPickOperationSchema = z.object({
  op: z.literal('pick'),
  paths: z.array(z.string().min(1)).min(1, 'At least one path is required'),
});

export const transformOperationSchema = z.discriminatedUnion('op', [
  transformDefaultOperationSchema,
  transformTemplateOperationSchema,
  transformPickOperationSchema,
]);

export const transformStepSchema = z.object({
  type: z.literal('transform'),
  ops: z.array(transformOperationSchema).min(1, 'At least one operation is required'),
});

// ============================================================================
// HTTP Request Step Validation
// ============================================================================

export const httpBodyCtxSchema = z.object({
  mode: z.literal('ctx'),
});

export const httpBodyCustomSchema = z.object({
  mode: z.literal('custom'),
  value: z.record(z.unknown()),
});

export const httpBodySchema = z.discriminatedUnion('mode', [
  httpBodyCtxSchema,
  httpBodyCustomSchema,
]);

export const httpRequestStepSchema = z.object({
  type: z.literal('http_request'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  url: z.string().min(1, 'URL is required').url('Must be a valid URL'),
  headers: z.record(z.string()).optional(),
  body: httpBodySchema.optional(),
  timeoutMs: z.number().int().min(100).max(60000).default(5000),
  retries: z.number().int().min(0).max(10).default(0),
});

// ============================================================================
// Workflow Step Validation
// ============================================================================

export const workflowStepSchema = z.discriminatedUnion('type', [
  filterStepSchema,
  transformStepSchema,
  httpRequestStepSchema,
]);

// ============================================================================
// Workflow Validation
// ============================================================================

export const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  enabled: z.boolean().optional().default(true),
  steps: z.array(workflowStepSchema).min(1, 'At least one step is required'),
});

export const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  enabled: z.boolean().optional(),
  steps: z.array(workflowStepSchema).optional(),
});

export const triggerPathSchema = z.string().regex(
  /^\/t\/[a-f0-9]{32}$/,
  'Invalid trigger path format'
);

// ============================================================================
// Type Exports
// ============================================================================

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type WorkflowStepInput = z.infer<typeof workflowStepSchema>;