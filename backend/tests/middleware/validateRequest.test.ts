import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateBody, validateQuery } from '../../src/middleware/validateRequest';
import { ValidationError } from '../../src/errors/AppError';

describe('validateRequest Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {}
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('validateBody', () => {
    it('should pass validation with valid body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      });

      mockRequest.body = {
        name: 'John Doe',
        age: 30
      };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should fail validation with invalid body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      });

      mockRequest.body = {
        name: 'John Doe'
        // missing age
      };

      const middleware = validateBody(schema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow(ValidationError);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with wrong data types', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      });

      mockRequest.body = {
        name: 'John Doe',
        age: 'thirty' // should be number
      };

      const middleware = validateBody(schema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow(ValidationError);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should include validation error details', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
      });

      mockRequest.body = {
        email: 'invalid-email',
        password: 'short'
      };

      const middleware = validateBody(schema);

      try {
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.errors).toBeDefined();
          expect(error.errors!.length).toBeGreaterThan(0);
          expect(error.errors![0]).toHaveProperty('field');
          expect(error.errors![0]).toHaveProperty('message');
        }
      }
    });

    it('should apply default values from schema', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        isActive: Joi.boolean().default(true)
      });

      mockRequest.body = {
        name: 'John Doe'
        // isActive not provided, should default to true
      };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body.isActive).toBe(true);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should strip unknown fields', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      mockRequest.body = {
        name: 'John Doe',
        unknownField: 'should be removed'
      };

      const middleware = validateBody(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body).toEqual({ name: 'John Doe' });
      expect(mockRequest.body.unknownField).toBeUndefined();
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery', () => {
    it('should pass validation with valid query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
      });

      mockRequest.query = {
        page: '2',
        limit: '20'
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(nextFunction).toHaveBeenCalledTimes(1);
    });

    it('should fail validation with invalid query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).required()
      });

      mockRequest.query = {
        page: 'invalid'
      };

      const middleware = validateQuery(schema);

      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow(ValidationError);

      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should apply default values for missing query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
      });

      mockRequest.query = {};

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.query.page).toBe(1);
      expect(mockRequest.query.limit).toBe(10);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should handle optional query parameters', () => {
      const schema = Joi.object({
        search: Joi.string().optional(),
        sort: Joi.string().optional()
      });

      mockRequest.query = {
        search: 'test'
        // sort is optional and not provided
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.query.search).toBe('test');
      expect(mockRequest.query.sort).toBeUndefined();
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
});
