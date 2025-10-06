import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      'GET /health': 'Health check endpoint',
      'GET /api-docs': 'API documentation',
      'POST /api/v1/apartments': 'Create new apartment',
      'POST /api/v1/apartments/search': 'Search & filter apartments',
      'GET /api/v1/apartments/locations': 'Get all locations',
      'GET /api/v1/apartments/:id': 'Get apartment by ID',
      'PUT /api/v1/apartments/:id': 'Update apartment',
      'DELETE /api/v1/apartments/:id': 'Delete apartment'
    }
  });
};

