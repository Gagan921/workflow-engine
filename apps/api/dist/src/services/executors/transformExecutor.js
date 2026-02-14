/**
 * Transform Step Executor
 * 
 * Executes transform steps that modify the execution context.
 * Supports: default, template, and pick operations.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TransformExecutor", {
    enumerable: true,
    get: function() {
        return TransformExecutor;
    }
});
const _lodash = require("lodash");
const _templateEngine = require("../../utils/templateEngine");
const _logger = require("../../utils/logger");
class TransformExecutor {
    canHandle(stepType) {
        return stepType === 'transform';
    }
    async execute(step, ctx) {
        _logger.logger.debug({
            message: 'Executing transform step',
            runId: ctx.runId,
            stepIndex: ctx.stepIndex,
            operationCount: step.ops.length
        });
        // Clone the data to avoid mutating the original
        let data = (0, _lodash.cloneDeep)(ctx.data);
        for (const op of step.ops){
            data = this.applyOperation(op, data, ctx);
        }
        _logger.logger.debug({
            message: 'Transform step completed',
            runId: ctx.runId,
            stepIndex: ctx.stepIndex
        });
        return {
            success: true,
            skipped: false,
            data
        };
    }
    applyOperation(op, data, ctx) {
        switch(op.op){
            case 'default':
                return this.applyDefault(op, data);
            case 'template':
                return this.applyTemplate(op, data, ctx);
            case 'pick':
                return this.applyPick(op, data);
            default:
                throw new Error(`Unsupported transform operation: ${op.op}`);
        }
    }
    applyDefault(op, data) {
        const currentValue = (0, _lodash.get)(data, op.path);
        // Apply default if value is missing, null, or empty string
        if (currentValue === undefined || currentValue === null || currentValue === '') {
            _logger.logger.debug({
                message: 'Applying default value',
                path: op.path,
                defaultValue: op.value
            });
            (0, _lodash.set)(data, op.path, op.value);
        }
        return data;
    }
    applyTemplate(op, data, ctx) {
        _logger.logger.debug({
            message: 'Applying template',
            target: op.to,
            template: op.template
        });
        // Create a context that includes both data and workflow metadata
        const templateContext = {
            ...data,
            workflow_id: ctx.workflowId,
            run_id: ctx.runId
        };
        const renderedValue = (0, _templateEngine.renderTemplate)(op.template, templateContext, {
            missingValue: ''
        });
        (0, _lodash.set)(data, op.to, renderedValue);
        return data;
    }
    applyPick(op, data) {
        _logger.logger.debug({
            message: 'Applying pick operation',
            paths: op.paths
        });
        const picked = {};
        for (const path of op.paths){
            const value = (0, _lodash.get)(data, path);
            if (value !== undefined) {
                (0, _lodash.set)(picked, path, value);
            }
        }
        return picked;
    }
}

//# sourceMappingURL=transformExecutor.js.map