/**
 * API Internal Types
 * 
 * Types specific to the API layer that don't need to be shared with the frontend.
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
    get NotFoundError () {
        return NotFoundError;
    },
    get ValidationError () {
        return ValidationError;
    },
    get WorkflowDisabledError () {
        return WorkflowDisabledError;
    },
    get WorkflowError () {
        return WorkflowError;
    }
});
class WorkflowError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code, statusCode = 500, details){
        super(message), this.code = code, this.statusCode = statusCode, this.details = details;
        this.name = 'WorkflowError';
        Object.setPrototypeOf(this, WorkflowError.prototype);
    }
}
class ValidationError extends WorkflowError {
    constructor(message, details){
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
class NotFoundError extends WorkflowError {
    constructor(resource, id){
        super(`${resource} with id '${id}' not found`, 'NOT_FOUND', 404);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
class WorkflowDisabledError extends WorkflowError {
    constructor(workflowId){
        super(`Workflow '${workflowId}' is disabled`, 'WORKFLOW_DISABLED', 403);
        this.name = 'WorkflowDisabledError';
        Object.setPrototypeOf(this, WorkflowDisabledError.prototype);
    }
}

//# sourceMappingURL=index.js.map