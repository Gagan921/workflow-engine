/**
 * Workflow Engine Service
 * 
 * Core service that orchestrates workflow execution.
 * Uses Strategy pattern for step execution.
 */

import { Workflow, WorkflowStep, StepResult, WorkflowRunStatus } from '@workflow/shared-types';
import { 
  ExecuteWorkflowInput, 
  ExecuteWorkflowOutput, 
  StepExecutionContext,
  StepExecutionResult,
  WorkflowDisabledError,
  NotFoundError
} from '@/types';
import { workflowRepository } from '@/repositories/workflowRepository';
import { workflowRunRepository } from '@/repositories/workflowRunRepository';
import { StepExecutor } from './executors/baseExecutor';
import { FilterExecutor } from './executors/filterExecutor';
import { TransformExecutor } from './executors/transformExecutor';
import { HttpRequestExecutor } from './executors/httpRequestExecutor';
import { logger } from '@/utils/logger';

export class WorkflowEngine {
  private executors: StepExecutor[];

  constructor() {
    // Register all step executors
    this.executors = [
      new FilterExecutor(),
      new TransformExecutor(),
      new HttpRequestExecutor(),
    ];
  }

  /**
   * Execute a workflow by ID
   */
  async executeById(input: ExecuteWorkflowInput): Promise<ExecuteWorkflowOutput> {
    const { workflowId, triggerData } = input;

    logger.info({
      message: 'Starting workflow execution',
      workflowId,
      runId: '', // Will be set after creating run
    });

    // Fetch workflow
    const workflow = await workflowRepository.findById(workflowId);
    
    if (!workflow) {
      throw new NotFoundError('Workflow', workflowId);
    }

    // Check if workflow is enabled
    if (!workflow.enabled) {
      throw new WorkflowDisabledError(workflowId);
    }

    // Execute the workflow
    return this.executeWorkflow(workflow, triggerData);
  }

  /**
   * Execute a workflow by trigger path
   */
  async executeByTriggerPath(
    path: string, 
    triggerData: Record<string, unknown>
  ): Promise<ExecuteWorkflowOutput> {
    logger.info({
      message: 'Looking up workflow by trigger path',
      path,
    });

    const workflow = await workflowRepository.findByTriggerPath(path);
    
    if (!workflow) {
      throw new NotFoundError('Workflow', path);
    }

    // Check if workflow is enabled
    if (!workflow.enabled) {
      throw new WorkflowDisabledError(workflow.id);
    }

    return this.executeWorkflow(workflow, triggerData);
  }

  /**
   * Execute a workflow with the given trigger data
   */
  private async executeWorkflow(
    workflow: Workflow,
    triggerData: Record<string, unknown>
  ): Promise<ExecuteWorkflowOutput> {
    const startTime = Date.now();

    // Create workflow run record
    const run = await workflowRunRepository.create(workflow.id, triggerData);
    
    logger.info({
      message: 'Workflow run created',
      workflowId: workflow.id,
      runId: run.id,
    });

    // Mark as running
    await workflowRunRepository.markAsRunning(run.id);

    // Execute steps
    const stepResults: StepResult[] = [];
    let currentData = { ...triggerData };
    let finalStatus: WorkflowRunStatus = 'success';
    let finalError: string | undefined;

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        const stepStartTime = Date.now();

        const ctx: StepExecutionContext = {
          workflowId: workflow.id,
          runId: run.id,
          stepIndex: i,
          data: currentData,
        };

        logger.debug({
          message: `Executing step ${i + 1}/${workflow.steps.length}`,
          runId: run.id,
          stepIndex: i,
          stepType: step.type,
        });

        const result = await this.executeStep(step, ctx);
        const stepDuration = Date.now() - stepStartTime;

        // Record step result
        const stepResult: StepResult = {
          stepIndex: i,
          stepType: step.type,
          status: result.skipped ? 'skipped' : result.success ? 'success' : 'failed',
          error: result.error,
          durationMs: stepDuration,
        };
        stepResults.push(stepResult);

        // Handle step result
        if (result.skipped) {
          logger.info({
            message: 'Workflow run skipped due to filter step',
            runId: run.id,
            stepIndex: i,
          });
          finalStatus = 'skipped';
          break;
        }

        if (!result.success) {
          logger.warn({
            message: 'Step execution failed, stopping workflow',
            runId: run.id,
            stepIndex: i,
            error: result.error,
          });
          finalStatus = 'failed';
          finalError = result.error;
          break;
        }

        // Update context data for next step
        currentData = result.data;
      }
    } catch (error) {
      logger.error({
        message: 'Unexpected error during workflow execution',
        runId: run.id,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      finalStatus = 'failed';
      finalError = (error as Error).message;
    }

    // Update run status
    const duration = Date.now() - startTime;
    
    if (finalStatus === 'success') {
      await workflowRunRepository.markAsSuccess(run.id, stepResults);
    } else if (finalStatus === 'skipped') {
      await workflowRunRepository.markAsSkipped(run.id, stepResults);
    } else {
      await workflowRunRepository.markAsFailed(run.id, finalError || 'Unknown error', stepResults);
    }

    logger.info({
      message: 'Workflow execution completed',
      workflowId: workflow.id,
      runId: run.id,
      status: finalStatus,
      durationMs: duration,
    });

    return {
      runId: run.id,
      status: finalStatus,
      error: finalError,
    };
  }

  /**
   * Execute a single step using the appropriate executor
   */
  private async executeStep(
    step: WorkflowStep,
    ctx: StepExecutionContext
  ): Promise<StepExecutionResult> {
    const executor = this.executors.find(e => e.canHandle(step.type));
    
    if (!executor) {
      throw new Error(`No executor found for step type: ${step.type}`);
    }

    return executor.execute(step, ctx);
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();