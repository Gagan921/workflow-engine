/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the API.
 * Converts known errors to appropriate HTTP responses.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { WorkflowError, ValidationError } from '@/types';
import { logger } from '@/utils/logger';

interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
  stack?: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] || 'unknown';
  
  // Log the error with context
  logger.error({
    message: err.message,
    error: err.name,
    stack: err.stack,
    requestId,
    path: req.path,
    method: req.method,
  });

  // Handle known workflow errors
  if (err instanceof WorkflowError) {
    const response: ErrorResponse = {
      error: err.message,
      code: err.code,
    };
    
    if (err.details) {
      response.details = err.details;
    }
    
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    
    err.errors.forEach((issue) => {
      const path = issue.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(issue.message);
    });
    
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details,
    });
    return;
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response: ErrorResponse = {
    error: isDevelopment ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
  };

  if (isDevelopment && err.stack) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}