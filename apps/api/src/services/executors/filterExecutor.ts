/**
 * Filter Step Executor
 * 
 * Executes filter steps that gate workflow execution based on conditions.
 * Supports eq (equals) and neq (not equals) operators.
 */

import { get } from 'lodash';
import { FilterStep, FilterCondition } from '@workflow/shared-types';
import { StepExecutionContext, StepExecutionResult } from '@/types';
import { StepExecutor } from './baseExecutor';
import { logger } from '@/utils/logger';

export class FilterExecutor implements StepExecutor {
  canHandle(stepType: string): boolean {
    return stepType === 'filter';
  }

  async execute(
    step: FilterStep, 
    ctx: StepExecutionContext
  ): Promise<StepExecutionResult> {
    logger.debug({
      message: 'Executing filter step',
      runId: ctx.runId,
      stepIndex: ctx.stepIndex,
      conditionCount: step.conditions.length,
    });

    for (const condition of step.conditions) {
      const matches = this.evaluateCondition(condition, ctx.data);
      
      if (!matches) {
        logger.info({
          message: 'Filter condition failed, skipping workflow',
          runId: ctx.runId,
          stepIndex: ctx.stepIndex,
          condition,
        });

        return {
          success: true,
          skipped: true,
          data: ctx.data,
        };
      }
    }

    logger.debug({
      message: 'All filter conditions passed',
      runId: ctx.runId,
      stepIndex: ctx.stepIndex,
    });

    return {
      success: true,
      skipped: false,
      data: ctx.data,
    };
  }

  private evaluateCondition(
    condition: FilterCondition, 
    data: Record<string, unknown>
  ): boolean {
    const actualValue = get(data, condition.path);
    const expectedValue = condition.value;

    logger.debug({
      message: 'Evaluating condition',
      path: condition.path,
      op: condition.op,
      expectedValue,
      actualValue,
    });

    switch (condition.op) {
      case 'eq':
        return this.isEqual(actualValue, expectedValue);
      case 'neq':
        return !this.isEqual(actualValue, expectedValue);
      default:
        throw new Error(`Unsupported filter operator: ${condition.op}`);
    }
  }

  private isEqual(a: unknown, b: unknown): boolean {
    // Handle null/undefined equality
    if (a === null || a === undefined) {
      return b === null || b === undefined;
    }

    // Strict equality for same types
    if (typeof a === typeof b) {
      return a === b;
    }

    // Loose equality for different types (e.g., number vs string)
    return a == b;
  }
}