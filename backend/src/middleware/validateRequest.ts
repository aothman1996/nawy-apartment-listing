import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ValidationError } from '../errors/AppError';

/**
 * Middleware factory to validate request body/query/params using Joi schema
 */
export const validateRequest = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Collect all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      // Format Joi errors to be more user-friendly
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      throw new ValidationError('Validation failed', errors);
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: Schema) => validateRequest(schema, 'body');

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: Schema) => validateRequest(schema, 'query');

/**
 * Validate request path parameters
 */
export const validateParams = (schema: Schema) => validateRequest(schema, 'params');

