import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  handlePrismaError
} from '../../src/errors/AppError';

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 500, true, 'TEST_ERROR');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should have Error as name property (default JavaScript behavior)', () => {
      const error = new AppError('Test error', 500, true, 'TEST_ERROR');

      expect(error.name).toBe('Error');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 500, true, 'TEST_ERROR');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should use default values when not provided', () => {
      const error = new AppError('Test error');

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct properties', () => {
      const validationErrors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' }
      ];

      const error = new ValidationError('Validation failed', validationErrors);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(validationErrors);
      expect(error.errors).toBeDefined();
      expect(error.errors!.length).toBe(2);
    });

    it('should use default message when not provided', () => {
      const error = new ValidationError();

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
    });

    it('should handle empty errors array', () => {
      const error = new ValidationError('Validation failed', []);

      expect(error.errors).toEqual([]);
      expect(error.errors).toBeDefined();
      expect(error.errors!.length).toBe(0);
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with resource name', () => {
      const error = new NotFoundError('Apartment', '123');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Apartment with ID \'123\' not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create NotFoundError without ID', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should use default resource name when not provided', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with correct properties', () => {
      const error = new ConflictError('Resource already exists');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });

    it('should use default message when not provided', () => {
      const error = new ConflictError();

      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with correct properties', () => {
      const error = new DatabaseError('Database connection failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });

    it('should use default message when not provided', () => {
      const error = new DatabaseError();

      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('handlePrismaError', () => {
    it('should handle errors with P2002 code (Unique constraint)', () => {
      const prismaError = {
        code: 'P2002',
        meta: {
          target: ['email']
        },
        message: 'Unique constraint failed'
      };

      const result = handlePrismaError(prismaError as any);

      expect(result).toBeInstanceOf(ConflictError);
      expect(result.message).toContain('email');
      expect(result.statusCode).toBe(409);
    });

    it('should handle errors with P2025 code (Record not found)', () => {
      const prismaError = {
        code: 'P2025',
        message: 'Record not found'
      };

      const result = handlePrismaError(prismaError as any);

      expect(result).toBeInstanceOf(NotFoundError);
      expect(result.message).toContain('not found');
      expect(result.statusCode).toBe(404);
    });

    it('should handle errors with P2003 code (Foreign key constraint)', () => {
      const prismaError = {
        code: 'P2003',
        message: 'Foreign key constraint failed'
      };

      const result = handlePrismaError(prismaError as any);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toBe('Invalid reference to related record');
      expect(result.statusCode).toBe(400);
    });

    it('should handle Prisma errors with P-codes', () => {
      const prismaError = {
        code: 'P2011',
        meta: { target: 'email' },
        message: 'Null constraint violation'
      };

      const result = handlePrismaError(prismaError as any);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.message).toContain('email');
      expect(result.message).toContain('cannot be null');
      expect(result.statusCode).toBe(400);
    });

    it('should handle unknown Prisma P-codes', () => {
      const prismaError = {
        code: 'P9999',
        message: 'Unknown Prisma error'
      };

      const result = handlePrismaError(prismaError as any);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Database operation failed');
      expect(result.statusCode).toBe(500);
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Something went wrong');

      const result = handlePrismaError(genericError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('An unexpected database error occurred');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('Error hierarchy and instanceof checks', () => {
    it('should maintain correct instanceof relationships', () => {
      const appError = new AppError('Test', 500, true, 'TEST');
      const validationError = new ValidationError('Test', []);
      const notFoundError = new NotFoundError('Test');
      const conflictError = new ConflictError('Test');
      const databaseError = new DatabaseError('Test');

      // All should be instances of Error
      expect(appError).toBeInstanceOf(Error);
      expect(validationError).toBeInstanceOf(Error);
      expect(notFoundError).toBeInstanceOf(Error);
      expect(conflictError).toBeInstanceOf(Error);
      expect(databaseError).toBeInstanceOf(Error);

      // All should be instances of AppError
      expect(appError).toBeInstanceOf(AppError);
      expect(validationError).toBeInstanceOf(AppError);
      expect(notFoundError).toBeInstanceOf(AppError);
      expect(conflictError).toBeInstanceOf(AppError);
      expect(databaseError).toBeInstanceOf(AppError);

      // Specific checks
      expect(validationError).toBeInstanceOf(ValidationError);
      expect(notFoundError).toBeInstanceOf(NotFoundError);
      expect(conflictError).toBeInstanceOf(ConflictError);
      expect(databaseError).toBeInstanceOf(DatabaseError);
    });

    it('should not be instances of sibling classes', () => {
      const notFoundError = new NotFoundError('Test');
      const validationError = new ValidationError('Test', []);

      expect(notFoundError).not.toBeInstanceOf(ValidationError);
      expect(validationError).not.toBeInstanceOf(NotFoundError);
    });
  });
});