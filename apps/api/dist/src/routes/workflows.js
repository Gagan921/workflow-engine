/**
 * Workflow Routes
 * 
 * Defines API endpoints for workflow management.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _express = require("express");
const _workflowController = require("../controllers/workflowController");
const router = (0, _express.Router)();
// Workflow CRUD endpoints
router.get('/', _workflowController.workflowController.list);
router.post('/', _workflowController.workflowController.create);
router.get('/:id', _workflowController.workflowController.get);
router.put('/:id', _workflowController.workflowController.update);
router.patch('/:id', _workflowController.workflowController.update);
router.delete('/:id', _workflowController.workflowController.delete);
// Workflow runs
router.get('/:id/runs', _workflowController.workflowController.getRuns);
const _default = router;

//# sourceMappingURL=workflows.js.map