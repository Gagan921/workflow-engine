/**
 * Template Engine
 * 
 * Handles variable substitution using {{variable}} syntax.
 * Supports dot-notation for nested properties (e.g., {{user.name}}).
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
    get extractVariables () {
        return extractVariables;
    },
    get hasTemplateVariables () {
        return hasTemplateVariables;
    },
    get renderObjectTemplates () {
        return renderObjectTemplates;
    },
    get renderTemplate () {
        return renderTemplate;
    }
});
const _lodash = require("lodash");
const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g;
function extractVariables(template) {
    const variables = [];
    let match;
    // Reset regex lastIndex
    TEMPLATE_REGEX.lastIndex = 0;
    while((match = TEMPLATE_REGEX.exec(template)) !== null){
        variables.push(match[1].trim());
    }
    return [
        ...new Set(variables)
    ]; // Remove duplicates
}
function renderTemplate(template, data, options = {}) {
    const { missingValue = '' } = options;
    return template.replace(TEMPLATE_REGEX, (match, path)=>{
        const trimmedPath = path.trim();
        const value = (0, _lodash.get)(data, trimmedPath);
        if (value === undefined || value === null) {
            return missingValue;
        }
        return String(value);
    });
}
function renderObjectTemplates(obj, data, options = {}) {
    if (typeof obj === 'string') {
        return renderTemplate(obj, data, options);
    }
    if (Array.isArray(obj)) {
        return obj.map((item)=>renderObjectTemplates(item, data, options));
    }
    if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)){
            result[key] = renderObjectTemplates(value, data, options);
        }
        return result;
    }
    return obj;
}
function hasTemplateVariables(str) {
    TEMPLATE_REGEX.lastIndex = 0;
    return TEMPLATE_REGEX.test(str);
}

//# sourceMappingURL=templateEngine.js.map