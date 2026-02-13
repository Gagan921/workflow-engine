/**
 * Workflow Controller
 * 
 * HTTP request handlers for workflow-related endpoints.
 */

import { Request, Response } from 'express';
import { workflowService } from '@/services/workflowService';
import { workflowEngine } from '@/services/workflowEngine';
import { createWorkflowSchema, updateWorkflowSchema } from '@/utils/validation';
import { asyncHandler } from '@/middleware/errorHandler';

export const workflowController = {
  /**
   * GET /workflows
   * List all workflows
   */
  list: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const workflows = await workflowService.getAllWorkflows();
    res.json({ workflows });
  }),

  /**
   * GET /workflows/:id
   * Get a single workflow by ID
   */
  get: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const workflow = await workflowService.getWorkflowById(id);
    res.json(workflow);
  }),

  /**
   * POST /workflows
   * Create a new workflow
   */
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validatedData = createWorkflowSchema.parse(req.body);
    
    const workflow = await workflowService.createWorkflow(validatedData);
    res.status(201).json(workflow);
  }),

  /**
   * PUT/PATCH /workflows/:id
   * Update an existing workflow
   */
  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Validate request body
    const validatedData = updateWorkflowSchema.parse(req.body);
    
    const workflow = await workflowService.updateWorkflow(id, validatedData);
    res.json(workflow);
  }),

  /**
   * DELETE /workflows/:id
   * Delete a workflow
   */
  delete: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await workflowService.deleteWorkflow(id);
    res.status(204).send();
  }),

  /**
   * GET /workflows/:id/runs
   * Get workflow run history
   */
  getRuns: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const runs = await workflowService.getWorkflowRuns(id);
    res.json({ runs });
  }),
};

export const triggerController = {
  /**
   * POST /t/:path
   * Trigger a workflow by its trigger path
   */
  trigger: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const path = `/t/${req.params.path}`;
    const triggerData = req.body as Record<string, unknown>;
    
    const result = await workflowEngine.executeByTriggerPath(path, triggerData);
    
    // Return appropriate status code based on result
    const statusCode = result.status === 'success' ? 200 : 
                       result.status === 'skipped' ? 200 : 500;
    
    res.status(statusCode).json({
      runId: result.runId,
      status: result.status,
      message: result.error,
    });
  }),
};