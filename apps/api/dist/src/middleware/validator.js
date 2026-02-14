/**
 * Request Validator Middleware
 * 
 * Validates incoming requests against Zod schemas.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "validate", {
    enumerable: true,
    get: function() {
        return validate;
    }
});
const _types = require("../types");
function validate(targets) {
    return async (req, _res, next)=>{
        try {
            const errors = {};
            if (targets.body) {
                const result = await targets.body.safeParseAsync(req.body);
                if (!result.success) {
                    extractErrors(result.error, 'body', errors);
                } else {
                    req.body = result.data;
                }
            }
            if (targets.query) {
                const result = await targets.query.safeParseAsync(req.query);
                if (!result.success) {
                    extractErrors(result.error, 'query', errors);
                } else {
                    req.query = result.data;
                }
            }
            if (targets.params) {
                const result = await targets.params.safeParseAsync(req.params);
                if (!result.success) {
                    extractErrors(result.error, 'params', errors);
                } else {
                    req.params = result.data;
                }
            }
            if (Object.keys(errors).length > 0) {
                throw new _types.ValidationError('Validation failed', errors);
            }
            next();
        } catch (error) {
            next(error);
        }
    };
}
function extractErrors(zodError, prefix, errors) {
    zodError.errors.forEach((issue)=>{
        const path = `${prefix}.${issue.path.join('.')}`;
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(issue.message);
    });
}

//# sourceMappingURL=validator.js.map