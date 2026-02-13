/**
 * Base Step Executor Interface
 * 
 * Defines the contract for all step executors.
 * Uses Strategy pattern for different step types.
 */

import { WorkflowStep } from '@workflow/shared-types';
import { StepExecutionContext, StepExecutionResult } from '@/types';

export interface StepExecutor {
  /**
   * Execute a workflow step
   * 
   * @param step - The step configuration
   * @param ctx - The execution context containing current data
   * @returns The execution result with updated data
   */
  execute(step: WorkflowStep, ctx: StepExecutionContext): Promise<StepExecutionResult>;
  
  /**
   * Check if this executor can handle the given step type
   */
  canHandle(stepType: string): boolean;
}