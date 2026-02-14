/**
 * Workflow Controller
 * 
 * HTTP request handlers for workflow-related endpoints.
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
    get triggerController () {
        return triggerController;
    },
    get workflowController () {
        return workflowController;
    }
});
const _workflowService = require("../services/workflowService");
const _workflowEngine = require("../services/workflowEngine");
const _validation = require("../utils/validation");
const _errorHandler = require("../middleware/errorHandler");
const workflowController = {
    /**
   * GET /workflows
   * List all workflows
   */ list: (0, _errorHandler.asyncHandler)(async (_req, res)=>{
        const workflows = await _workflowService.workflowService.getAllWorkflows();
        res.json({
            workflows
        });
    }),
    /**
   * GET /workflows/:id
   * Get a single workflow by ID
   */ get: (0, _errorHandler.asyncHandler)(async (req, res)=>{
        const { id } = req.params;
        const workflow = await _workflowService.workflowService.getWorkflowById(id);
        res.json(workflow);
    }),
    /**
   * POST /workflows
   * Create a new workflow
   */ create: (0, _errorHandler.asyncHandler)(async (req, res)=>{
        // Validate request body
        const validatedData = _validation.createWorkflowSchema.parse(req.body);
        const workflow = await _workflowService.workflowService.createWorkflow(validatedData);
        res.status(201).json(workflow);
    }),
    /**
   * PUT/PATCH /workflows/:id
   * Update an existing workflow
   */ update: (0, _errorHandler.asyncHandler)(async (req, res)=>{
        const { id } = req.params;
        // Validate request body
        const validatedData = _validation.updateWorkflowSchema.parse(req.body);
        const workflow = await _workflowService.workflowService.updateWorkflow(id, validatedData);
        res.json(workflow);
    }),
    /**
   * DELETE /workflows/:id
   * Delete a workflow
   */ delete: (0, _errorHandler.asyncHandler)(async (req, res)=>{
        const { id } = req.params;
        await _workflowService.workflowService.deleteWorkflow(id);
        res.status(204).send();
    }),
    /**
   * GET /workflows/:id/runs
   * Get workflow run history
   */ getRuns: (0, _errorHandler.asyncHandler)(async (req, res)=>{
        const { id } = req.params;
        const runs = await _workflowService.workflowService.getWorkflowRuns(id);
        res.json({
            runs
        });
    })
};
const triggerController = {
    /**
   * POST /t/:path
   * Trigger a workflow by its trigger path
   */ trigger: (0, _errorHandler.asyncHandler)(async (req, res)=>{
        const path = `/t/${req.params.path}`;
        const triggerData = req.body;
        const result = await _workflowEngine.workflowEngine.executeByTriggerPath(path, triggerData);
        // Return appropriate status code based on result
        const statusCode = result.status === 'success' ? 200 : result.status === 'skipped' ? 200 : 500;
        res.status(statusCode).json({
            runId: result.runId,
            status: result.status,
            message: result.error
        });
    })
};

//# sourceMappingURL=workflowController.js.map