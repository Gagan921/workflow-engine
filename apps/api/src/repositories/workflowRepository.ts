/**
 * Workflow Repository
 * 
 * Data access layer for workflow-related database operations.
 * Uses Prisma client for type-safe database access.
 */

import { prisma, Workflow, WorkflowRun } from '@workflow/database';
import { 
  Workflow as WorkflowModel, 
  WorkflowRun as WorkflowRunModel,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowRunStatus 
} from '@workflow/shared-types';
import { logger } from '@/utils/logger';

// JSON serialization helper for Prisma
function serializeWorkflow(workflow: Workflow): WorkflowModel {
  return {
    id: workflow.id,
    name: workflow.name,
    enabled: workflow.enabled,
    trigger: workflow.trigger as WorkflowModel['trigger'],
    steps: workflow.steps as WorkflowModel['steps'],
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
  };
}

function serializeWorkflowRun(run: WorkflowRun): WorkflowRunModel {
  return {
    id: run.id,
    workflowId: run.workflowId,
    status: run.status as WorkflowRunStatus,
    startedAt: run.startedAt,
    completedAt: run.completedAt || undefined,
    error: run.error || undefined,
    ctx: run.ctx as Record<string, unknown> || undefined,
    stepResults: run.stepResults as WorkflowRunModel['stepResults'] || undefined,
  };
}

export class WorkflowRepository {
  /**
   * Find all workflows with optional filtering
   */
  async findAll(options?: { enabled?: boolean }): Promise<WorkflowModel[]> {
    const where = options?.enabled !== undefined 
      ? { enabled: options.enabled } 
      : {};

    const workflows = await prisma.workflow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return workflows.map(serializeWorkflow);
  }

  /**
   * Find a workflow by ID
   */
  async findById(id: string): Promise<WorkflowModel | null> {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
    });

    return workflow ? serializeWorkflow(workflow) : null;
  }

  /**
   * Find a workflow by trigger path
   */
  async findByTriggerPath(path: string): Promise<WorkflowModel | null> {
    const workflows = await prisma.workflow.findMany({
      where: {
        trigger: {
          path: {
            equals: path,
          },
        },
      },
    });

    // Since we're using JSON field, we need to filter in memory
    const matchingWorkflow = workflows.find(w => {
      const trigger = w.trigger as { path?: string };
      return trigger.path === path;
    });

    return matchingWorkflow ? serializeWorkflow(matchingWorkflow) : null;
  }

  /**
   * Create a new workflow
   */
  async create(data: CreateWorkflowRequest & { trigger: WorkflowModel['trigger'] }): Promise<WorkflowModel> {
    const workflow = await prisma.workflow.create({
      data: {
        name: data.name,
        enabled: data.enabled ?? true,
        trigger: data.trigger as unknown as Workflow['trigger'],
        steps: data.steps as unknown as Workflow['steps'],
      },
    });

    logger.info({ message: 'Workflow created', workflowId: workflow.id, name: workflow.name });

    return serializeWorkflow(workflow);
  }

  /**
   * Update an existing workflow
   */
  async update(id: string, data: UpdateWorkflowRequest): Promise<WorkflowModel> {
    const updateData: Partial<Workflow> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.enabled !== undefined) {
      updateData.enabled = data.enabled;
    }

    if (data.steps !== undefined) {
      updateData.steps = data.steps as unknown as Workflow['steps'];
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
    });

    logger.info({ message: 'Workflow updated', workflowId: workflow.id });

    return serializeWorkflow(workflow);
  }

  /**
   * Delete a workflow
   */
  async delete(id: string): Promise<void> {
    await prisma.workflow.delete({
      where: { id },
    });

    logger.info({ message: 'Workflow deleted', workflowId: id });
  }

  /**
   * Check if a workflow exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.workflow.count({
      where: { id },
    });

    return count > 0;
  }
}

// Singleton instance
export const workflowRepository = new WorkflowRepository();