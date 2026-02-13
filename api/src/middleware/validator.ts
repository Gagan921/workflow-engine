/**
 * Request Validator Middleware
 * 
 * Validates incoming requests against Zod schemas.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/types';

interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(targets: ValidationTargets) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Record<string, string[]> = {};

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
        throw new ValidationError('Validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

function extractErrors(
  zodError: ZodError,
  prefix: string,
  errors: Record<string, string[]>
): void {
  zodError.errors.forEach((issue) => {
    const path = `${prefix}.${issue.path.join('.')}`;
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });
}