import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import apartmentRoutes from '../../src/routes/apartmentRoutes';
import { errorHandler } from '../../src/middleware/errorHandler';
import { notFoundHandler } from '../../src/middleware/notFoundHandler';
import { apartmentService } from '../../src/services/apartmentService';
import { mockApartment, mockPaginatedResponse } from '../utils/testHelpers';

// Type for Jest mocks
type JestMock<T> = T & {
  mockResolvedValue: (value: any) => void;
  mockRejectedValue: (value: any) => void;
  mockReturnValue: (value: any) => void;
  toHaveBeenCalledWith: (...args: any[]) => void;
  toHaveBeenCalled: () => void;
};

// Mock the apartment service
jest.mock('../../src/services/apartmentService');

// Create test app
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }));

  // Routes
  app.use('/api/v1/apartments', apartmentRoutes);
  
  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
};

describe('Apartment Routes Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  // Note: GET /api/v1/apartments was removed and replaced with POST /api/v1/apartments/search
  // These tests are moved to the "POST /api/v1/apartments/search" section below

  describe('GET /api/v1/apartments/:id', () => {
    it('should return apartment by id', async () => {
      (apartmentService.getApartmentById as JestMock<any>).mockResolvedValue(mockApartment);

      const response = await request(app)
        .get('/api/v1/apartments/test-id')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockApartment,
          createdAt: mockApartment.createdAt.toISOString(),
          updatedAt: mockApartment.updatedAt.toISOString(),
        },
      });
      expect(apartmentService.getApartmentById).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when apartment not found', async () => {
      (apartmentService.getApartmentById as JestMock<any>).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/apartments/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Apartment not found');
    });
  });

  describe('POST /api/v1/apartments', () => {
    it('should create apartment with valid data', async () => {
      const apartmentData = {
        unitName: 'Test Unit',
        unitNumber: 'A101',
        project: 'Test Project',
        price: 150000,
        bedrooms: 2,
        bathrooms: 2,
        areaSqft: 1200,
        location: 'Test City',
      };

      (apartmentService.createApartment as JestMock<any>).mockResolvedValue(mockApartment);

      const response = await request(app)
        .post('/api/v1/apartments')
        .send(apartmentData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockApartment,
          createdAt: mockApartment.createdAt.toISOString(),
          updatedAt: mockApartment.updatedAt.toISOString(),
        },
        message: 'Apartment created successfully',
      });
      
      // Joi adds default values (images: [], amenities: [], isAvailable: true)
      expect(apartmentService.createApartment).toHaveBeenCalledWith(
        expect.objectContaining({
          ...apartmentData,
          images: [],
          amenities: [],
          isAvailable: true
        })
      );
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        unitName: '', // Invalid: empty string
        price: -100, // Invalid: negative price
        bedrooms: 25, // Invalid: too many bedrooms (max is 20)
      };

      const response = await request(app)
        .post('/api/v1/apartments')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Validation failed');
      expect(response.body.error.errors).toBeDefined();
      expect(Array.isArray(response.body.error.errors)).toBe(true);
      expect(response.body.error.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        unitName: 'Test Unit',
        // Missing other required fields: unitNumber, project, price, bedrooms, bathrooms, areaSqft, location
      };

      const response = await request(app)
        .post('/api/v1/apartments')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.errors).toBeDefined();
      expect(response.body.error.errors.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/v1/apartments/:id', () => {
    it('should update apartment with valid data', async () => {
      const updateData = {
        price: 160000,
        description: 'Updated description',
      };

      (apartmentService.updateApartment as JestMock<any>).mockResolvedValue(mockApartment);

      const response = await request(app)
        .put('/api/v1/apartments/test-id')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          ...mockApartment,
          createdAt: mockApartment.createdAt.toISOString(),
          updatedAt: mockApartment.updatedAt.toISOString(),
        },
        message: 'Apartment updated successfully',
      });
      expect(apartmentService.updateApartment).toHaveBeenCalledWith('test-id', updateData);
    });

    it('should return 404 when apartment not found', async () => {
      const updateData = { price: 160000 };
      (apartmentService.updateApartment as JestMock<any>).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/apartments/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Apartment not found');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        price: -100, // Invalid: negative price
        bedrooms: 25, // Invalid: too many bedrooms (max is 20)
      };

      const response = await request(app)
        .put('/api/v1/apartments/test-id')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.errors).toBeDefined();
    });
  });

  describe('DELETE /api/v1/apartments/:id', () => {
    it('should delete apartment successfully', async () => {
      (apartmentService.deleteApartment as JestMock<any>).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/v1/apartments/test-id')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Apartment deleted successfully',
      });
      expect(apartmentService.deleteApartment).toHaveBeenCalledWith('test-id');
    });

    it('should return 404 when apartment not found', async () => {
      (apartmentService.deleteApartment as JestMock<any>).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/v1/apartments/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Apartment not found');
    });
  });

  describe('POST /api/v1/apartments/search', () => {
    it('should filter apartments with provided filters', async () => {
      (apartmentService.getApartments as JestMock<any>).mockResolvedValue(mockPaginatedResponse);

      const filters = {
        minPrice: 100000,
        maxPrice: 200000,
        bedrooms: [2], // Array format as per Joi schema
        page: 1,
        limit: 10,
      };

      const response = await request(app)
        .post('/api/v1/apartments/search')
        .send(filters)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPaginatedResponse.data.map(apt => ({
          ...apt,
          createdAt: apt.createdAt.toISOString(),
          updatedAt: apt.updatedAt.toISOString(),
        })),
        pagination: mockPaginatedResponse.pagination,
      });
      expect(apartmentService.getApartments).toHaveBeenCalledWith(filters);
    });

    it('should filter with search and multiple options', async () => {
      (apartmentService.getApartments as JestMock<any>).mockResolvedValue(mockPaginatedResponse);

      const filters = {
        search: 'test',
        minPrice: 100000,
        maxPrice: 200000,
        bedrooms: [2, 3],
        bathrooms: [2],
        page: 2,
        limit: 5,
        sortBy: 'price',
        sortOrder: 'asc',
      };

      const response = await request(app)
        .post('/api/v1/apartments/search')
        .send(filters)
        .expect(200);

      expect(apartmentService.getApartments).toHaveBeenCalledWith(filters);
    });

    it('should return all apartments when no filters provided (uses defaults)', async () => {
      (apartmentService.getApartments as JestMock<any>).mockResolvedValue(mockPaginatedResponse);

      const response = await request(app)
        .post('/api/v1/apartments/search')
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockPaginatedResponse.data.map(apt => ({
          ...apt,
          createdAt: apt.createdAt.toISOString(),
          updatedAt: apt.updatedAt.toISOString(),
        })),
        pagination: mockPaginatedResponse.pagination,
      });
      
      // Joi adds defaults (page: 1, limit: 10)
      expect(apartmentService.getApartments).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10
        })
      );
    });

    it('should handle service errors', async () => {
      (apartmentService.getApartments as JestMock<any>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/v1/apartments/search')
        .send({})
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/apartments/locations', () => {
    it('should return popular locations', async () => {
      const locations = ['Test City', 'Another City'];
      (apartmentService.getPopularLocations as JestMock<any>).mockResolvedValue(locations);

      const response = await request(app)
        .get('/api/v1/apartments/locations')
        .query({ limit: 5 })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: locations,
      });
      expect(apartmentService.getPopularLocations).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/apartments')
        .set('Content-Type', 'application/json')
        .send('invalid json');
        
      // Express body-parser returns 400 for malformed JSON
      expect([400, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });
});
