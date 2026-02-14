/**
 * Filter Step Executor
 * 
 * Executes filter steps that gate workflow execution based on conditions.
 * Supports eq (equals) and neq (not equals) operators.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FilterExecutor", {
    enumerable: true,
    get: function() {
        return FilterExecutor;
    }
});
const _lodash = require("lodash");
const _logger = require("../../utils/logger");
class FilterExecutor {
    canHandle(stepType) {
        return stepType === 'filter';
    }
    async execute(step, ctx) {
        _logger.logger.debug({
            message: 'Executing filter step',
            runId: ctx.runId,
            stepIndex: ctx.stepIndex,
            conditionCount: step.conditions.length
        });
        for (const condition of step.conditions){
            const matches = this.evaluateCondition(condition, ctx.data);
            if (!matches) {
                _logger.logger.info({
                    message: 'Filter condition failed, skipping workflow',
                    runId: ctx.runId,
                    stepIndex: ctx.stepIndex,
                    condition
                });
                return {
                    success: true,
                    skipped: true,
                    data: ctx.data
                };
            }
        }
        _logger.logger.debug({
            message: 'All filter conditions passed',
            runId: ctx.runId,
            stepIndex: ctx.stepIndex
        });
        return {
            success: true,
            skipped: false,
            data: ctx.data
        };
    }
    evaluateCondition(condition, data) {
        const actualValue = (0, _lodash.get)(data, condition.path);
        const expectedValue = condition.value;
        _logger.logger.debug({
            message: 'Evaluating condition',
            path: condition.path,
            op: condition.op,
            expectedValue,
            actualValue
        });
        switch(condition.op){
            case 'eq':
                return this.isEqual(actualValue, expectedValue);
            case 'neq':
                return !this.isEqual(actualValue, expectedValue);
            default:
                throw new Error(`Unsupported filter operator: ${condition.op}`);
        }
    }
    isEqual(a, b) {
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

//# sourceMappingURL=filterExecutor.js.map