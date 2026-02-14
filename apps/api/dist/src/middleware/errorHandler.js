/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the API.
 * Converts known errors to appropriate HTTP responses.
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
    get asyncHandler () {
        return asyncHandler;
    },
    get errorHandler () {
        return errorHandler;
    }
});
const _zod = require("zod");
const _types = require("../types");
const _logger = require("../utils/logger");
function errorHandler(err, req, res, _next) {
    const requestId = req.headers['x-request-id'] || 'unknown';
    // Log the error with context
    _logger.logger.error({
        message: err.message,
        error: err.name,
        stack: err.stack,
        requestId,
        path: req.path,
        method: req.method
    });
    // Handle known workflow errors
    if (err instanceof _types.WorkflowError) {
        const response = {
            error: err.message,
            code: err.code
        };
        if (err.details) {
            response.details = err.details;
        }
        res.status(err.statusCode).json(response);
        return;
    }
    // Handle Zod validation errors
    if (err instanceof _zod.ZodError) {
        const details = {};
        err.errors.forEach((issue)=>{
            const path = issue.path.join('.');
            if (!details[path]) {
                details[path] = [];
            }
            details[path].push(issue.message);
        });
        res.status(400).json({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details
        });
        return;
    }
    // Handle unknown errors
    const isDevelopment = process.env.NODE_ENV === 'development';
    const response = {
        error: isDevelopment ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
    };
    if (isDevelopment && err.stack) {
        response.stack = err.stack;
    }
    res.status(500).json(response);
}
function asyncHandler(fn) {
    return (req, res, next)=>{
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

//# sourceMappingURL=errorHandler.js.map