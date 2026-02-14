/**
 * Workflow Engine API
 * 
 * Main entry point for the workflow engine backend.
 * Sets up Express server with middleware and routes.
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
require("dotenv/config");
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _cors = /*#__PURE__*/ _interop_require_default(require("cors"));
const _helmet = /*#__PURE__*/ _interop_require_default(require("helmet"));
const _morgan = /*#__PURE__*/ _interop_require_default(require("morgan"));
const _workflows = /*#__PURE__*/ _interop_require_default(require("./routes/workflows"));
const _trigger = /*#__PURE__*/ _interop_require_default(require("./routes/trigger"));
const _errorHandler = require("./middleware/errorHandler");
const _logger = require("./utils/logger");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Initialize Express app
const app = (0, _express.default)();
// Security middleware
app.use((0, _helmet.default)());
// CORS middleware
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, _cors.default)({
    origin: (origin, callback)=>{
        if (!origin) return callback(null, true); // allow server-to-server / postman
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
// Logging middleware
app.use((0, _morgan.default)('combined', {
    stream: _logger.morganStream
}));
// Body parsing middleware
app.use(_express.default.json({
    limit: '10mb'
}));
app.use(_express.default.urlencoded({
    extended: true
}));
// Health check endpoint
app.get('/health', (_req, res)=>{
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
// API routes
app.use('/workflows', _workflows.default);
// Trigger routes (webhook endpoints)
app.use('/t', _trigger.default);
// 404 handler
app.use((_req, res)=>{
    res.status(404).json({
        error: 'Not found',
        code: 'NOT_FOUND'
    });
});
// Global error handler
app.use(_errorHandler.errorHandler);
// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>{
    _logger.logger.info({
        message: 'Workflow Engine API started',
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});
const _default = app;

//# sourceMappingURL=index.js.map