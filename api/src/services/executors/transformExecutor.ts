/**
 * Transform Step Executor
 * 
 * Executes transform steps that modify the execution context.
 * Supports: default, template, and pick operations.
 */

import { get, set, cloneDeep } from 'lodash';
import { TransformStep, TransformOperation } from '@workflow/shared-types';
import { StepExecutionContext, StepExecutionResult } from '@/types';
import { StepExecutor } from './baseExecutor';
import { renderTemplate } from '@/utils/templateEngine';
import { logger } from '@/utils/logger';

export class TransformExecutor implements StepExecutor {
  canHandle(stepType: string): boolean {
    return stepType === 'transform';
  }

  async execute(
    step: TransformStep, 
    ctx: StepExecutionContext
  ): Promise<StepExecutionResult> {
    logger.debug({
      message: 'Executing transform step',
      runId: ctx.runId,
      stepIndex: ctx.stepIndex,
      operationCount: step.ops.length,
    });

    // Clone the data to avoid mutating the original
    let data = cloneDeep(ctx.data);

    for (const op of step.ops) {
      data = this.applyOperation(op, data, ctx);
    }

    logger.debug({
      message: 'Transform step completed',
      runId: ctx.runId,
      stepIndex: ctx.stepIndex,
    });

    return {
      success: true,
      skipped: false,
      data,
    };
  }

  private applyOperation(
    op: TransformOperation,
    data: Record<string, unknown>,
    ctx: StepExecutionContext
  ): Record<string, unknown> {
    switch (op.op) {
      case 'default':
        return this.applyDefault(op, data);
      case 'template':
        return this.applyTemplate(op, data, ctx);
      case 'pick':
        return this.applyPick(op, data);
      default:
        throw new Error(`Unsupported transform operation: ${(op as TransformOperation).op}`);
    }
  }

  private applyDefault(
    op: { path: string; value: unknown },
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const currentValue = get(data, op.path);
    
    // Apply default if value is missing, null, or empty string
    if (currentValue === undefined || currentValue === null || currentValue === '') {
      logger.debug({
        message: 'Applying default value',
        path: op.path,
        defaultValue: op.value,
      });
      set(data, op.path, op.value);
    }

    return data;
  }

  private applyTemplate(
    op: { to: string; template: string },
    data: Record<string, unknown>,
    ctx: StepExecutionContext
  ): Record<string, unknown> {
    logger.debug({
      message: 'Applying template',
      target: op.to,
      template: op.template,
    });

    // Create a context that includes both data and workflow metadata
    const templateContext = {
      ...data,
      workflow_id: ctx.workflowId,
      run_id: ctx.runId,
    };

    const renderedValue = renderTemplate(op.template, templateContext, { missingValue: '' });
    set(data, op.to, renderedValue);

    return data;
  }

  private applyPick(
    op: { paths: string[] },
    data: Record<string, unknown>
  ): Record<string, unknown> {
    logger.debug({
      message: 'Applying pick operation',
      paths: op.paths,
    });

    const picked: Record<string, unknown> = {};
    
    for (const path of op.paths) {
      const value = get(data, path);
      if (value !== undefined) {
        set(picked, path, value);
      }
    }

    return picked;
  }
}