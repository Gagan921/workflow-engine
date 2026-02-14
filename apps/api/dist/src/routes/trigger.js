/**
 * Trigger Routes
 * 
 * Defines webhook trigger endpoints for workflow execution.
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
// Webhook trigger endpoint
// Note: This is mounted at /t in the main app, so the path here is just :path
router.post('/:path', _workflowController.triggerController.trigger);
const _default = router;

//# sourceMappingURL=trigger.js.map