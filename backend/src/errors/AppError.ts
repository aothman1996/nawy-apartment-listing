/**
 * Custom error classes for better error handling and debugging
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: any[];

  constructor(message: string = 'Validation failed', errors?: any[]) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, 404, true, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, true, 'CONFLICT');
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, true, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, true, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(message, 500, false, 'DATABASE_ERROR');
    if (originalError) {
      this.stack = originalError.stack;
    }
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service '${service}' is unavailable`,
      503,
      true,
      'EXTERNAL_SERVICE_ERROR'
    );
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Helper to determine if error is a Prisma error and convert to AppError
 */
export function handlePrismaError(error: any): AppError {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  
  if (error.code === 'P2002') {
    // Unique constraint violation
    const field = error.meta?.target?.[0] || 'field';
    return new ConflictError(`A record with this ${field} already exists`);
  }
  
  if (error.code === 'P2025') {
    // Record not found
    return new NotFoundError('Record');
  }
  
  if (error.code === 'P2003') {
    // Foreign key constraint violation
    return new ValidationError('Invalid reference to related record');
  }
  
  if (error.code === 'P2011') {
    // Null constraint violation
    const field = error.meta?.target || 'field';
    return new ValidationError(`Required field '${field}' cannot be null`);
  }
  
  if (error.code === 'P2014') {
    // Invalid ID
    return new ValidationError('Invalid ID format');
  }
  
  // Generic Prisma errors
  if (error.code?.startsWith('P')) {
    return new DatabaseError('Database operation failed', error);
  }
  
  // Unknown errors
  return new DatabaseError('An unexpected database error occurred', error);
}

