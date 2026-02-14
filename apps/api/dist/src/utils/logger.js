/**
 * Logger Utility
 * 
 * Uses Winston for structured logging with different levels for different environments.
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
    get logger () {
        return logger;
    },
    get morganStream () {
        return morganStream;
    }
});
const _winston = /*#__PURE__*/ _interop_require_default(require("winston"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { combine, timestamp, json, errors, printf, colorize } = _winston.default.format;
// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata })=>{
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
// Determine log level based on environment
const getLogLevel = ()=>{
    if (process.env.LOG_LEVEL) {
        return process.env.LOG_LEVEL;
    }
    return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};
const logger = _winston.default.createLogger({
    level: getLogLevel(),
    defaultMeta: {
        service: 'workflow-api',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        new _winston.default.transports.Console({
            format: combine(timestamp(), errors({
                stack: true
            }), process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat))
        })
    ]
});
const morganStream = {
    write: (message)=>{
        logger.info(message.trim());
    }
};

//# sourceMappingURL=logger.js.map