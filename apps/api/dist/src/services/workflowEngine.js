/**
 * Workflow Engine Service
 * 
 * Core service that orchestrates workflow execution.
 * Uses Strategy pattern for step execution.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get WorkflowEngine () {
        return WorkflowEngine;
    },
    get workflowEngine () {
        return workflowEngine;
    }
});
const _types = require("../types");
const _workflowRepository = require("../repositories/workflowRepository");
const _workflowRunRepository = require("../repositories/workflowRunRepository");
const _filterExecutor = require("./executors/filterExecutor");
const _transformExecutor = require("./executors/transformExecutor");
const _httpRequestExecutor = require("./executors/httpRequestExecutor");
const _logger = require("../utils/logger");
class WorkflowEngine {
    executors;
    constructor(){
        // Register all step executors
        this.executors = [
            new _filterExecutor.FilterExecutor(),
            new _transformExecutor.TransformExecutor(),
            new _httpRequestExecutor.HttpRequestExecutor()
        ];
    }
    /**
   * Execute a workflow by ID
   */ async executeById(input) {
        const { workflowId, triggerData } = input;
        _logger.logger.info({
            message: 'Starting workflow execution',
            workflowId,
            runId: ''
        });
        // Fetch workflow
        const workflow = await _workflowRepository.workflowRepository.findById(workflowId);
        if (!workflow) {
            throw new _types.NotFoundError('Workflow', workflowId);
        }
        // Check if workflow is enabled
        if (!workflow.enabled) {
            throw new _types.WorkflowDisabledError(workflowId);
        }
        // Execute the workflow
        return this.executeWorkflow(workflow, triggerData);
    }
    /**
   * Execute a workflow by trigger path
   */ async executeByTriggerPath(path, triggerData) {
        _logger.logger.info({
            message: 'Looking up workflow by trigger path',
            path
        });
        const workflow = await _workflowRepository.workflowRepository.findByTriggerPath(path);
        if (!workflow) {
            throw new _types.NotFoundError('Workflow', path);
        }
        // Check if workflow is enabled
        if (!workflow.enabled) {
            throw new _types.WorkflowDisabledError(workflow.id);
        }
        return this.executeWorkflow(workflow, triggerData);
    }
    /**
   * Execute a workflow with the given trigger data
   */ async executeWorkflow(workflow, triggerData) {
        const startTime = Date.now();
        // Create workflow run record
        const run = await _workflowRunRepository.workflowRunRepository.create(workflow.id, triggerData);
        _logger.logger.info({
            message: 'Workflow run created',
            workflowId: workflow.id,
            runId: run.id
        });
        // Mark as running
        await _workflowRunRepository.workflowRunRepository.markAsRunning(run.id);
        // Execute steps
        const stepResults = [];
        let currentData = {
            ...triggerData
        };
        let finalStatus = 'success';
        let finalError;
        try {
            for(let i = 0; i < workflow.steps.length; i++){
                const step = workflow.steps[i];
                const stepStartTime = Date.now();
                const ctx = {
                    workflowId: workflow.id,
                    runId: run.id,
                    stepIndex: i,
                    data: currentData
                };
                _logger.logger.debug({
                    message: `Executing step ${i + 1}/${workflow.steps.length}`,
                    runId: run.id,
                    stepIndex: i,
                    stepType: step.type
                });
                const result = await this.executeStep(step, ctx);
                const stepDuration = Date.now() - stepStartTime;
                // Record step result
                const stepResult = {
                    stepIndex: i,
                    stepType: step.type,
                    status: result.skipped ? 'skipped' : result.success ? 'success' : 'failed',
                    error: result.error,
                    durationMs: stepDuration
                };
                stepResults.push(stepResult);
                // Handle step result
                if (result.skipped) {
                    _logger.logger.info({
                        message: 'Workflow run skipped due to filter step',
                        runId: run.id,
                        stepIndex: i
                    });
                    finalStatus = 'skipped';
                    break;
                }
                if (!result.success) {
                    _logger.logger.warn({
                        message: 'Step execution failed, stopping workflow',
                        runId: run.id,
                        stepIndex: i,
                        error: result.error
                    });
                    finalStatus = 'failed';
                    finalError = result.error;
                    break;
                }
                // Update context data for next step
                currentData = result.data;
            }
        } catch (error) {
            _logger.logger.error({
                message: 'Unexpected error during workflow execution',
                runId: run.id,
                error: error.message,
                stack: error.stack
            });
            finalStatus = 'failed';
            finalError = error.message;
        }
        // Update run status
        const duration = Date.now() - startTime;
        if (finalStatus === 'success') {
            await _workflowRunRepository.workflowRunRepository.markAsSuccess(run.id, stepResults);
        } else if (finalStatus === 'skipped') {
            await _workflowRunRepository.workflowRunRepository.markAsSkipped(run.id, stepResults);
        } else {
            await _workflowRunRepository.workflowRunRepository.markAsFailed(run.id, finalError || 'Unknown error', stepResults);
        }
        _logger.logger.info({
            message: 'Workflow execution completed',
            workflowId: workflow.id,
            runId: run.id,
            status: finalStatus,
            durationMs: duration
        });
        return {
            runId: run.id,
            status: finalStatus,
            error: finalError
        };
    }
    /**
   * Execute a single step using the appropriate executor
   */ async executeStep(step, ctx) {
        const executor = this.executors.find((e)=>e.canHandle(step.type));
        if (!executor) {
            throw new Error(`No executor found for step type: ${step.type}`);
        }
        return executor.execute(step, ctx);
    }
}
const workflowEngine = new WorkflowEngine();

//# sourceMappingURL=workflowEngine.js.map