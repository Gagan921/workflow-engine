/**
 * Logger Utility
 * 
 * Uses Winston for structured logging with different levels for different environments.
 */

import winston from 'winston';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Determine log level based on environment
const getLogLevel = (): string => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

// Create the logger instance
export const logger = winston.createLogger({
  level: getLogLevel(),
  defaultMeta: {
    service: 'workflow-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp(),
        errors({ stack: true }),
        process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat)
      ),
    }),
  ],
});

// Stream for Morgan HTTP logging integration
export const morganStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};