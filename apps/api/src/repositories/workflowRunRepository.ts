/**
 * Workflow Run Repository
 * 
 * Data access layer for workflow run-related database operations.
 */

import { prisma, WorkflowRun } from '@workflow/database';
import { 
  WorkflowRun as WorkflowRunModel,
  WorkflowRunStatus,
  StepResult 
} from '@workflow/shared-types';
import { logger } from '@/utils/logger';

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

export class WorkflowRunRepository {
  /**
   * Find all runs for a workflow
   */
  async findByWorkflowId(workflowId: string): Promise<WorkflowRunModel[]> {
    const runs = await prisma.workflowRun.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
    });

    return runs.map(serializeWorkflowRun);
  }

  /**
   * Find a run by ID
   */
  async findById(id: string): Promise<WorkflowRunModel | null> {
    const run = await prisma.workflowRun.findUnique({
      where: { id },
    });

    return run ? serializeWorkflowRun(run) : null;
  }

  /**
   * Create a new workflow run
   */
  async create(workflowId: string, ctx: Record<string, unknown>): Promise<WorkflowRunModel> {
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        status: 'pending',
        ctx: ctx as unknown as WorkflowRun['ctx'],
      },
    });

    logger.debug({ message: 'Workflow run created', runId: run.id, workflowId });

    return serializeWorkflowRun(run);
  }

  /**
   * Update run status to running
   */
  async markAsRunning(id: string): Promise<void> {
    await prisma.workflowRun.update({
      where: { id },
      data: { status: 'running' },
    });

    logger.debug({ message: 'Workflow run started', runId: id });
  }

  /**
   * Mark run as completed successfully
   */
  async markAsSuccess(id: string, stepResults: StepResult[]): Promise<void> {
    await prisma.workflowRun.update({
      where: { id },
      data: {
        status: 'success',
        completedAt: new Date(),
        stepResults: stepResults as unknown as WorkflowRun['stepResults'],
      },
    });

    logger.info({ message: 'Workflow run completed successfully', runId: id });
  }

  /**
   * Mark run as failed
   */
  async markAsFailed(id: string, error: string, stepResults: StepResult[]): Promise<void> {
    await prisma.workflowRun.update({
      where: { id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error,
        stepResults: stepResults as unknown as WorkflowRun['stepResults'],
      },
    });

    logger.warn({ message: 'Workflow run failed', runId: id, error });
  }

  /**
   * Mark run as skipped
   */
  async markAsSkipped(id: string, stepResults: StepResult[]): Promise<void> {
    await prisma.workflowRun.update({
      where: { id },
      data: {
        status: 'skipped',
        completedAt: new Date(),
        stepResults: stepResults as unknown as WorkflowRun['stepResults'],
      },
    });

    logger.info({ message: 'Workflow run skipped', runId: id });
  }

  /**
   * Get recent runs across all workflows
   */
  async getRecentRuns(limit: number = 50): Promise<WorkflowRunModel[]> {
    const runs = await prisma.workflowRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return runs.map(serializeWorkflowRun);
  }
}

// Singleton instance
export const workflowRunRepository = new WorkflowRunRepository();