/**
 * Workflow Service
 * 
 * Business logic layer for workflow operations.
 * Coordinates between repositories and the workflow engine.
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
    get WorkflowService () {
        return WorkflowService;
    },
    get workflowService () {
        return workflowService;
    }
});
const _uuid = require("uuid");
const _types = require("../types");
const _workflowRepository = require("../repositories/workflowRepository");
const _workflowRunRepository = require("../repositories/workflowRunRepository");
const _logger = require("../utils/logger");
/**
 * Generate a unique trigger path for a workflow
 */ function generateTriggerPath() {
    // Generate a 32-character hex string (128 bits of entropy)
    const randomBytes = (0, _uuid.v4)().replace(/-/g, '') + (0, _uuid.v4)().replace(/-/g, '').slice(0, 16);
    return `/t/${randomBytes}`;
}
/**
 * Convert internal workflow model to API response
 */ function toResponse(workflow) {
    return {
        id: workflow.id,
        name: workflow.name,
        enabled: workflow.enabled,
        trigger: workflow.trigger,
        steps: workflow.steps,
        createdAt: workflow.createdAt.toISOString(),
        updatedAt: workflow.updatedAt.toISOString()
    };
}
class WorkflowService {
    /**
   * Get all workflows
   */ async getAllWorkflows() {
        const workflows = await _workflowRepository.workflowRepository.findAll();
        return workflows.map(toResponse);
    }
    /**
   * Get a workflow by ID
   */ async getWorkflowById(id) {
        const workflow = await _workflowRepository.workflowRepository.findById(id);
        if (!workflow) {
            throw new _types.NotFoundError('Workflow', id);
        }
        return toResponse(workflow);
    }
    /**
   * Create a new workflow
   */ async createWorkflow(data) {
        // Generate unique trigger path
        const triggerPath = generateTriggerPath();
        const trigger = {
            type: 'http',
            path: triggerPath
        };
        _logger.logger.info({
            message: 'Creating workflow',
            name: data.name,
            triggerPath
        });
        const workflow = await _workflowRepository.workflowRepository.create({
            name: data.name,
            enabled: data.enabled ?? true,
            trigger,
            steps: data.steps
        });
        return toResponse(workflow);
    }
    /**
   * Update an existing workflow
   */ async updateWorkflow(id, data) {
        // Check if workflow exists
        const existing = await _workflowRepository.workflowRepository.findById(id);
        if (!existing) {
            throw new _types.NotFoundError('Workflow', id);
        }
        _logger.logger.info({
            message: 'Updating workflow',
            workflowId: id,
            updates: Object.keys(data)
        });
        const workflow = await _workflowRepository.workflowRepository.update(id, data);
        return toResponse(workflow);
    }
    /**
   * Delete a workflow
   */ async deleteWorkflow(id) {
        // Check if workflow exists
        const existing = await _workflowRepository.workflowRepository.findById(id);
        if (!existing) {
            throw new _types.NotFoundError('Workflow', id);
        }
        _logger.logger.info({
            message: 'Deleting workflow',
            workflowId: id
        });
        await _workflowRepository.workflowRepository.delete(id);
    }
    /**
   * Get workflow runs
   */ async getWorkflowRuns(workflowId) {
        // Check if workflow exists
        const existing = await _workflowRepository.workflowRepository.findById(workflowId);
        if (!existing) {
            throw new _types.NotFoundError('Workflow', workflowId);
        }
        const runs = await _workflowRunRepository.workflowRunRepository.findByWorkflowId(workflowId);
        return runs.map((run)=>({
                id: run.id,
                workflowId: run.workflowId,
                status: run.status,
                startedAt: run.startedAt.toISOString(),
                completedAt: run.completedAt?.toISOString(),
                error: run.error
            }));
    }
}
const workflowService = new WorkflowService();

//# sourceMappingURL=workflowService.js.map