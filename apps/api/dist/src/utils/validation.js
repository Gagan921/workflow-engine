/**
 * Validation Schemas
 * 
 * Zod schemas for validating workflow definitions and API requests.
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
    get createWorkflowSchema () {
        return createWorkflowSchema;
    },
    get filterConditionSchema () {
        return filterConditionSchema;
    },
    get filterOperatorSchema () {
        return filterOperatorSchema;
    },
    get filterStepSchema () {
        return filterStepSchema;
    },
    get httpBodyCtxSchema () {
        return httpBodyCtxSchema;
    },
    get httpBodyCustomSchema () {
        return httpBodyCustomSchema;
    },
    get httpBodySchema () {
        return httpBodySchema;
    },
    get httpRequestStepSchema () {
        return httpRequestStepSchema;
    },
    get transformDefaultOperationSchema () {
        return transformDefaultOperationSchema;
    },
    get transformOperationSchema () {
        return transformOperationSchema;
    },
    get transformPickOperationSchema () {
        return transformPickOperationSchema;
    },
    get transformStepSchema () {
        return transformStepSchema;
    },
    get transformTemplateOperationSchema () {
        return transformTemplateOperationSchema;
    },
    get triggerPathSchema () {
        return triggerPathSchema;
    },
    get updateWorkflowSchema () {
        return updateWorkflowSchema;
    },
    get workflowStepSchema () {
        return workflowStepSchema;
    }
});
const _zod = require("zod");
const filterOperatorSchema = _zod.z.enum([
    'eq',
    'neq'
]);
const filterConditionSchema = _zod.z.object({
    path: _zod.z.string().min(1, 'Path is required'),
    op: filterOperatorSchema,
    value: _zod.z.unknown()
});
const filterStepSchema = _zod.z.object({
    type: _zod.z.literal('filter'),
    conditions: _zod.z.array(filterConditionSchema).min(1, 'At least one condition is required')
});
const transformDefaultOperationSchema = _zod.z.object({
    op: _zod.z.literal('default'),
    path: _zod.z.string().min(1, 'Path is required'),
    value: _zod.z.unknown()
});
const transformTemplateOperationSchema = _zod.z.object({
    op: _zod.z.literal('template'),
    to: _zod.z.string().min(1, 'Target field is required'),
    template: _zod.z.string().min(1, 'Template is required')
});
const transformPickOperationSchema = _zod.z.object({
    op: _zod.z.literal('pick'),
    paths: _zod.z.array(_zod.z.string().min(1)).min(1, 'At least one path is required')
});
const transformOperationSchema = _zod.z.discriminatedUnion('op', [
    transformDefaultOperationSchema,
    transformTemplateOperationSchema,
    transformPickOperationSchema
]);
const transformStepSchema = _zod.z.object({
    type: _zod.z.literal('transform'),
    ops: _zod.z.array(transformOperationSchema).min(1, 'At least one operation is required')
});
const httpBodyCtxSchema = _zod.z.object({
    mode: _zod.z.literal('ctx')
});
const httpBodyCustomSchema = _zod.z.object({
    mode: _zod.z.literal('custom'),
    value: _zod.z.record(_zod.z.unknown())
});
const httpBodySchema = _zod.z.discriminatedUnion('mode', [
    httpBodyCtxSchema,
    httpBodyCustomSchema
]);
const httpRequestStepSchema = _zod.z.object({
    type: _zod.z.literal('http_request'),
    method: _zod.z.enum([
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE'
    ]),
    url: _zod.z.string().min(1, 'URL is required').url('Must be a valid URL'),
    headers: _zod.z.record(_zod.z.string()).optional(),
    body: httpBodySchema.optional(),
    timeoutMs: _zod.z.number().int().min(100).max(60000).default(5000),
    retries: _zod.z.number().int().min(0).max(10).default(0)
});
const workflowStepSchema = _zod.z.discriminatedUnion('type', [
    filterStepSchema,
    transformStepSchema,
    httpRequestStepSchema
]);
const createWorkflowSchema = _zod.z.object({
    name: _zod.z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    enabled: _zod.z.boolean().optional().default(true),
    steps: _zod.z.array(workflowStepSchema).min(1, 'At least one step is required')
});
const updateWorkflowSchema = _zod.z.object({
    name: _zod.z.string().min(1).max(255).optional(),
    enabled: _zod.z.boolean().optional(),
    steps: _zod.z.array(workflowStepSchema).optional()
});
const triggerPathSchema = _zod.z.string().regex(/^\/t\/[a-f0-9]{32}$/, 'Invalid trigger path format');

//# sourceMappingURL=validation.js.map