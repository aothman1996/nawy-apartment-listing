import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let errors: any[] | undefined;

  // If it's our custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
    
    if (error instanceof ValidationError) {
      errors = error.errors;
    }
  } else {
    // Unexpected errors
    message = error.message || 'An unexpected error occurred';
  }

  // Build error context for logging
  const errorContext = {
    code,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: (req as any).id, // Request ID from pino-http
    ...(errors && { validationErrors: errors })
  };

  // Log based on severity
  if (statusCode >= 500) {
    logger.error({ ...errorContext, err: error }, error.message);
  } else if (statusCode >= 400) {
    logger.warn(errorContext, error.message);
  }

  // Don't leak error details in production for 500 errors
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    code = 'INTERNAL_ERROR';
  }

  // Build response
  const response: any = {
    success: false,
    error: {
      code,
      message,
      ...(errors && { errors })
    }
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && !process.env.JEST_WORKER_ID) {
    response.error.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

