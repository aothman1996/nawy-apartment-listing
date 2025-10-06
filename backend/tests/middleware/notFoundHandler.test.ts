import { Request, Response } from 'express';
import { notFoundHandler } from '../../src/middleware/notFoundHandler';

describe('notFoundHandler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      method: 'GET',
      path: '/api/v1/non-existent',
      originalUrl: '/api/v1/non-existent?query=test'
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock
    };
  });

  it('should respond with 404 status code', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
  });

  it('should include the original URL in the response message', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('/api/v1/non-existent?query=test')
      })
    );
  });

  it('should include available endpoints in the response', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.any(String),
        availableEndpoints: expect.any(Object)
      })
    );
  });

  it('should list API endpoints in availableEndpoints', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    const callArg = jsonMock.mock.calls[0][0];
    expect(callArg.availableEndpoints).toBeDefined();
    expect(Object.keys(callArg.availableEndpoints).length).toBeGreaterThan(0);
  });

  it('should handle POST requests', () => {
    mockRequest.method = 'POST';
    mockRequest.originalUrl = '/api/v1/invalid-endpoint';

    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('/api/v1/invalid-endpoint')
      })
    );
  });

  it('should handle PUT requests', () => {
    mockRequest.method = 'PUT';
    mockRequest.originalUrl = '/api/v1/apartments/999';

    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('/api/v1/apartments/999')
      })
    );
  });

  it('should handle DELETE requests', () => {
    mockRequest.method = 'DELETE';
    mockRequest.originalUrl = '/api/v1/apartments/abc';

    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('/api/v1/apartments/abc')
      })
    );
  });

  it('should set success to false', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    const callArg = jsonMock.mock.calls[0][0];
    expect(callArg.success).toBe(false);
  });

  it('should handle paths with query parameters', () => {
    mockRequest.originalUrl = '/api/v1/search?q=test&page=2';

    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('/api/v1/search?q=test&page=2')
      })
    );
  });

  it('should handle root path', () => {
    mockRequest.originalUrl = '/';

    notFoundHandler(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('/')
      })
    );
  });

  it('should provide helpful endpoint documentation', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response);

    const callArg = jsonMock.mock.calls[0][0];
    const endpoints = callArg.availableEndpoints;

    // Check that key endpoints are documented
    expect(endpoints).toHaveProperty('GET /health');
    expect(endpoints).toHaveProperty('GET /api-docs');
    
    // Check that endpoint values are descriptive strings
    expect(typeof endpoints['GET /health']).toBe('string');
    expect(endpoints['GET /health'].length).toBeGreaterThan(0);
  });
});