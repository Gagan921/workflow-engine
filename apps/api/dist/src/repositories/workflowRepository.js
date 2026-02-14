/**
 * Workflow Repository
 * 
 * Data access layer for workflow-related database operations.
 * Uses Prisma client for type-safe database access.
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
    get WorkflowRepository () {
        return WorkflowRepository;
    },
    get workflowRepository () {
        return workflowRepository;
    }
});
const _database = require("@workflow/database");
const _logger = require("../utils/logger");
// JSON serialization helper for Prisma
function serializeWorkflow(workflow) {
    return {
        id: workflow.id,
        name: workflow.name,
        enabled: workflow.enabled,
        trigger: workflow.trigger,
        steps: workflow.steps,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt
    };
}
function serializeWorkflowRun(run) {
    return {
        id: run.id,
        workflowId: run.workflowId,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt || undefined,
        error: run.error || undefined,
        ctx: run.ctx || undefined,
        stepResults: run.stepResults || undefined
    };
}
class WorkflowRepository {
    /**
   * Find all workflows with optional filtering
   */ async findAll(options) {
        const where = options?.enabled !== undefined ? {
            enabled: options.enabled
        } : {};
        const workflows = await _database.prisma.workflow.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return workflows.map(serializeWorkflow);
    }
    /**
   * Find a workflow by ID
   */ async findById(id) {
        const workflow = await _database.prisma.workflow.findUnique({
            where: {
                id
            }
        });
        return workflow ? serializeWorkflow(workflow) : null;
    }
    /**
   * Find a workflow by trigger path
   */ async findByTriggerPath(path) {
        const workflows = await _database.prisma.workflow.findMany({
            where: {
                trigger: {
                    path: {
                        equals: path
                    }
                }
            }
        });
        // Since we're using JSON field, we need to filter in memory
        const matchingWorkflow = workflows.find((w)=>{
            const trigger = w.trigger;
            return trigger.path === path;
        });
        return matchingWorkflow ? serializeWorkflow(matchingWorkflow) : null;
    }
    /**
   * Create a new workflow
   */ async create(data) {
        const workflow = await _database.prisma.workflow.create({
            data: {
                name: data.name,
                enabled: data.enabled ?? true,
                trigger: data.trigger,
                steps: data.steps
            }
        });
        _logger.logger.info({
            message: 'Workflow created',
            workflowId: workflow.id,
            name: workflow.name
        });
        return serializeWorkflow(workflow);
    }
    /**
   * Update an existing workflow
   */ async update(id, data) {
        const updateData = {};
        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.enabled !== undefined) {
            updateData.enabled = data.enabled;
        }
        if (data.steps !== undefined) {
            updateData.steps = data.steps;
        }
        const workflow = await _database.prisma.workflow.update({
            where: {
                id
            },
            data: updateData
        });
        _logger.logger.info({
            message: 'Workflow updated',
            workflowId: workflow.id
        });
        return serializeWorkflow(workflow);
    }
    /**
   * Delete a workflow
   */ async delete(id) {
        await _database.prisma.workflow.delete({
            where: {
                id
            }
        });
        _logger.logger.info({
            message: 'Workflow deleted',
            workflowId: id
        });
    }
    /**
   * Check if a workflow exists
   */ async exists(id) {
        const count = await _database.prisma.workflow.count({
            where: {
                id
            }
        });
        return count > 0;
    }
}
const workflowRepository = new WorkflowRepository();

//# sourceMappingURL=workflowRepository.js.map