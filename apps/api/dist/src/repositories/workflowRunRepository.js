/**
 * Workflow Run Repository
 * 
 * Data access layer for workflow run-related database operations.
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
    get WorkflowRunRepository () {
        return WorkflowRunRepository;
    },
    get workflowRunRepository () {
        return workflowRunRepository;
    }
});
const _database = require("@workflow/database");
const _logger = require("../utils/logger");
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
class WorkflowRunRepository {
    /**
   * Find all runs for a workflow
   */ async findByWorkflowId(workflowId) {
        const runs = await _database.prisma.workflowRun.findMany({
            where: {
                workflowId
            },
            orderBy: {
                startedAt: 'desc'
            }
        });
        return runs.map(serializeWorkflowRun);
    }
    /**
   * Find a run by ID
   */ async findById(id) {
        const run = await _database.prisma.workflowRun.findUnique({
            where: {
                id
            }
        });
        return run ? serializeWorkflowRun(run) : null;
    }
    /**
   * Create a new workflow run
   */ async create(workflowId, ctx) {
        const run = await _database.prisma.workflowRun.create({
            data: {
                workflowId,
                status: 'pending',
                ctx: ctx
            }
        });
        _logger.logger.debug({
            message: 'Workflow run created',
            runId: run.id,
            workflowId
        });
        return serializeWorkflowRun(run);
    }
    /**
   * Update run status to running
   */ async markAsRunning(id) {
        await _database.prisma.workflowRun.update({
            where: {
                id
            },
            data: {
                status: 'running'
            }
        });
        _logger.logger.debug({
            message: 'Workflow run started',
            runId: id
        });
    }
    /**
   * Mark run as completed successfully
   */ async markAsSuccess(id, stepResults) {
        await _database.prisma.workflowRun.update({
            where: {
                id
            },
            data: {
                status: 'success',
                completedAt: new Date(),
                stepResults: stepResults
            }
        });
        _logger.logger.info({
            message: 'Workflow run completed successfully',
            runId: id
        });
    }
    /**
   * Mark run as failed
   */ async markAsFailed(id, error, stepResults) {
        await _database.prisma.workflowRun.update({
            where: {
                id
            },
            data: {
                status: 'failed',
                completedAt: new Date(),
                error,
                stepResults: stepResults
            }
        });
        _logger.logger.warn({
            message: 'Workflow run failed',
            runId: id,
            error
        });
    }
    /**
   * Mark run as skipped
   */ async markAsSkipped(id, stepResults) {
        await _database.prisma.workflowRun.update({
            where: {
                id
            },
            data: {
                status: 'skipped',
                completedAt: new Date(),
                stepResults: stepResults
            }
        });
        _logger.logger.info({
            message: 'Workflow run skipped',
            runId: id
        });
    }
    /**
   * Get recent runs across all workflows
   */ async getRecentRuns(limit = 50) {
        const runs = await _database.prisma.workflowRun.findMany({
            orderBy: {
                startedAt: 'desc'
            },
            take: limit
        });
        return runs.map(serializeWorkflowRun);
    }
}
const workflowRunRepository = new WorkflowRunRepository();

//# sourceMappingURL=workflowRunRepository.js.map