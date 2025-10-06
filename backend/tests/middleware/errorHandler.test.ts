import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler';
import { AppError } from '../../src/errors/AppError';
import { createMockRequest, createMockResponse } from '../utils/testHelpers';

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('general error handling', () => {
    it('should handle generic errors with default status code', () => {
      const error = new Error('Generic error');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Generic error',
        }
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not expose stack trace in production', () => {
      const error = new Error('Generic error');
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      errorHandler(error as AppError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal Server Error',
        }
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should use custom status code from error', () => {
      const error = new AppError('Custom error', 400);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'APP_ERROR',
          message: 'Custom error',
        }
      });
    });
  });

  describe('AppError handling', () => {
    it('should handle AppError instances correctly', () => {
      const error = new AppError('Test app error', 403);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'APP_ERROR',
          message: 'Test app error',
        }
      });
    });
  });

  describe('operational errors', () => {
    it('should handle operational errors', () => {
      const error = new AppError('Operational error', 400, true);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'APP_ERROR',
          message: 'Operational error',
        }
      });
    });
  });
});