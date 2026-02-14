/**
 * HTTP Request Step Executor
 * 
 * Executes HTTP request steps with timeout and retry support.
 * Supports template rendering in URLs, headers, and body.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HttpRequestExecutor", {
    enumerable: true,
    get: function() {
        return HttpRequestExecutor;
    }
});
const _templateEngine = require("../../utils/templateEngine");
const _logger = require("../../utils/logger");
class HttpRequestExecutor {
    canHandle(stepType) {
        return stepType === 'http_request';
    }
    async execute(step, ctx) {
        _logger.logger.debug({
            message: 'Executing HTTP request step',
            runId: ctx.runId,
            stepIndex: ctx.stepIndex,
            method: step.method,
            url: step.url
        });
        // Prepare the request configuration
        const config = this.prepareRequestConfig(step, ctx);
        // Execute with retries
        const result = await this.executeWithRetries(config, step.retries);
        if (!result.success) {
            return {
                success: false,
                error: result.error,
                data: ctx.data
            };
        }
        // Merge response data into context (optional - could be configurable)
        const updatedData = {
            ...ctx.data,
            _httpResponse: result.response
        };
        return {
            success: true,
            data: updatedData
        };
    }
    prepareRequestConfig(step, ctx) {
        // Create template context with data and metadata
        const templateContext = {
            ...ctx.data,
            workflow_id: ctx.workflowId,
            run_id: ctx.runId
        };
        // Render URL with templates
        const url = this.renderTemplate(step.url, templateContext);
        // Render headers with templates
        const headers = {
            'Content-Type': 'application/json',
            ...step.headers
        };
        const renderedHeaders = (0, _templateEngine.renderObjectTemplates)(headers, templateContext);
        // Prepare body
        let body = undefined;
        if (step.body) {
            if (step.body.mode === 'ctx') {
                body = ctx.data;
            } else if (step.body.mode === 'custom' && step.body.value) {
                body = (0, _templateEngine.renderObjectTemplates)(step.body.value, templateContext);
            }
        }
        return {
            method: step.method,
            url,
            headers: renderedHeaders,
            body,
            timeoutMs: step.timeoutMs,
            retries: step.retries
        };
    }
    renderTemplate(template, context) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, path)=>{
            const trimmedPath = path.trim();
            const keys = trimmedPath.split('.');
            let value = context;
            for (const key of keys){
                if (value === null || value === undefined) {
                    return '';
                }
                value = value[key];
            }
            return value === undefined || value === null ? '' : String(value);
        });
    }
    async executeWithRetries(config, maxRetries) {
        let lastError;
        for(let attempt = 0; attempt <= maxRetries; attempt++){
            if (attempt > 0) {
                // Exponential backoff: 2^attempt * 100ms (100ms, 200ms, 400ms, ...)
                const delay = Math.pow(2, attempt - 1) * 100;
                _logger.logger.debug({
                    message: `Retry attempt ${attempt}/${maxRetries}, waiting ${delay}ms`
                });
                await this.sleep(delay);
            }
            try {
                const response = await this.executeRequest(config);
                if (attempt > 0) {
                    _logger.logger.info({
                        message: `HTTP request succeeded after ${attempt} retries`
                    });
                }
                return {
                    success: true,
                    response
                };
            } catch (error) {
                lastError = error;
                const shouldRetry = this.shouldRetryError(error);
                if (!shouldRetry || attempt === maxRetries) {
                    break;
                }
                _logger.logger.warn({
                    message: `HTTP request failed, will retry`,
                    attempt: attempt + 1,
                    maxRetries,
                    error: lastError.message
                });
            }
        }
        return {
            success: false,
            error: lastError?.message || 'HTTP request failed'
        };
    }
    async executeRequest(config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), config.timeoutMs);
        try {
            const fetchOptions = {
                method: config.method,
                headers: config.headers,
                signal: controller.signal
            };
            if (config.body !== undefined && [
                'POST',
                'PUT',
                'PATCH'
            ].includes(config.method)) {
                fetchOptions.body = JSON.stringify(config.body);
            }
            _logger.logger.debug({
                message: 'Sending HTTP request',
                method: config.method,
                url: config.url,
                timeoutMs: config.timeoutMs
            });
            const response = await fetch(config.url, fetchOptions);
            clearTimeout(timeoutId);
            // Check for 5xx errors (should retry)
            if (response.status >= 500) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            // Check for 4xx errors (don't retry)
            if (response.status >= 400) {
                throw new Error(`Client error: ${response.status} ${response.statusText}`);
            }
            // Parse response body
            const contentType = response.headers.get('content-type');
            let body;
            if (contentType?.includes('application/json')) {
                body = await response.json();
            } else {
                body = await response.text();
            }
            _logger.logger.debug({
                message: 'HTTP request completed',
                status: response.status,
                url: config.url
            });
            return {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                body
            };
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${config.timeoutMs}ms`);
            }
            throw error;
        }
    }
    shouldRetryError(error) {
        if (error.name === 'AbortError') return true;
        if (error.code) {
            const retryableCodes = [
                'ECONNRESET',
                'ECONNREFUSED',
                'ETIMEDOUT',
                'EAI_AGAIN',
                'ENOTFOUND'
            ];
            if (retryableCodes.includes(error.code)) return true;
        }
        if (error.message?.includes('fetch failed')) return true;
        if (error.message?.includes('Server error')) return true;
        return false;
    }
    sleep(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
}

//# sourceMappingURL=httpRequestExecutor.js.map