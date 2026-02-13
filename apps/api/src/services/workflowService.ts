/**
 * Workflow Service
 * 
 * Business logic layer for workflow operations.
 * Coordinates between repositories and the workflow engine.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  Workflow, 
  CreateWorkflowRequest, 
  UpdateWorkflowRequest,
  WorkflowResponse 
} from '@workflow/shared-types';
import { NotFoundError } from '@/types';
import { workflowRepository } from '@/repositories/workflowRepository';
import { workflowRunRepository } from '@/repositories/workflowRunRepository';
import { logger } from '@/utils/logger';

/**
 * Generate a unique trigger path for a workflow
 */
function generateTriggerPath(): string {
  // Generate a 32-character hex string (128 bits of entropy)
  const randomBytes = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 16);
  return `/t/${randomBytes}`;
}

/**
 * Convert internal workflow model to API response
 */
function toResponse(workflow: Workflow): WorkflowResponse {
  return {
    id: workflow.id,
    name: workflow.name,
    enabled: workflow.enabled,
    trigger: workflow.trigger,
    steps: workflow.steps,
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
  };
}

export class WorkflowService {
  /**
   * Get all workflows
   */
  async getAllWorkflows(): Promise<WorkflowResponse[]> {
    const workflows = await workflowRepository.findAll();
    return workflows.map(toResponse);
  }

  /**
   * Get a workflow by ID
   */
  async getWorkflowById(id: string): Promise<WorkflowResponse> {
    const workflow = await workflowRepository.findById(id);
    
    if (!workflow) {
      throw new NotFoundError('Workflow', id);
    }

    return toResponse(workflow);
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(data: CreateWorkflowRequest): Promise<WorkflowResponse> {
    // Generate unique trigger path
    const triggerPath = generateTriggerPath();
    
    const trigger = {
      type: 'http' as const,
      path: triggerPath,
    };

    logger.info({
      message: 'Creating workflow',
      name: data.name,
      triggerPath,
    });

    const workflow = await workflowRepository.create({
      name: data.name,
      enabled: data.enabled ?? true,
      trigger,
      steps: data.steps,
    });

    return toResponse(workflow);
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<WorkflowResponse> {
    // Check if workflow exists
    const existing = await workflowRepository.findById(id);
    
    if (!existing) {
      throw new NotFoundError('Workflow', id);
    }

    logger.info({
      message: 'Updating workflow',
      workflowId: id,
      updates: Object.keys(data),
    });

    const workflow = await workflowRepository.update(id, data);
    return toResponse(workflow);
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    // Check if workflow exists
    const existing = await workflowRepository.findById(id);
    
    if (!existing) {
      throw new NotFoundError('Workflow', id);
    }

    logger.info({
      message: 'Deleting workflow',
      workflowId: id,
    });

    await workflowRepository.delete(id);
  }

  /**
   * Get workflow runs
   */
  async getWorkflowRuns(workflowId: string) {
    // Check if workflow exists
    const existing = await workflowRepository.findById(workflowId);
    
    if (!existing) {
      throw new NotFoundError('Workflow', workflowId);
    }

    const runs = await workflowRunRepository.findByWorkflowId(workflowId);
    
    return runs.map(run => ({
      id: run.id,
      workflowId: run.workflowId,
      status: run.status,
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      error: run.error,
    }));
  }
}

// Singleton instance
export const workflowService = new WorkflowService();