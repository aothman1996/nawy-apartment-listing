import { Request, Response } from 'express';
import { apartmentController } from '../../src/controllers/apartmentController';
import { apartmentService } from '../../src/services/apartmentService';
import {
  mockApartment,
  mockApartmentList,
  mockPaginatedResponse,
  mockPopularLocations,
  createMockRequest,
  createMockResponse,
} from '../utils/testHelpers';

// Mock the apartment service
jest.mock('../../src/services/apartmentService');

describe('ApartmentController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    jest.clearAllMocks();
  });

  describe('filterApartments', () => {
    it('should return filtered apartments with pagination', async () => {
      const mockFilters = {
        page: 1,
        limit: 10,
        bedrooms: [2, 3],
        minPrice: 1000000,
      };

      mockReq.body = mockFilters;
      (apartmentService.getApartments as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      await apartmentController.filterApartments(mockReq as Request, mockRes as Response);

      expect(apartmentService.getApartments).toHaveBeenCalledWith(mockFilters);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaginatedResponse.data,
        pagination: mockPaginatedResponse.pagination,
      });
    });

    it('should handle service errors', async () => {
      mockReq.body = {};
      (apartmentService.getApartments as jest.Mock).mockRejectedValue(new Error('Database error'));

      await apartmentController.filterApartments(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to filter apartments',
        error: 'Internal server error',
      });
    });
  });

  describe('getApartmentById', () => {
    it('should return apartment by id', async () => {
      mockReq.params = { id: 'test-id' };
      (apartmentService.getApartmentById as jest.Mock).mockResolvedValue(mockApartment);

      await apartmentController.getApartmentById(mockReq as Request, mockRes as Response);

      expect(apartmentService.getApartmentById).toHaveBeenCalledWith('test-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockApartment,
      });
    });

    it('should return 404 when apartment not found', async () => {
      mockReq.params = { id: 'non-existent-id' };
      (apartmentService.getApartmentById as jest.Mock).mockResolvedValue(null);

      await apartmentController.getApartmentById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Apartment not found',
      });
    });

    it('should return 400 when id is missing', async () => {
      mockReq.params = {};

      await apartmentController.getApartmentById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Apartment ID is required',
      });
    });
  });

  describe('createApartment', () => {
    it('should create apartment successfully', async () => {
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

      mockReq.body = apartmentData;
      (apartmentService.createApartment as jest.Mock).mockResolvedValue(mockApartment);

      await apartmentController.createApartment(mockReq as Request, mockRes as Response);

      expect(apartmentService.createApartment).toHaveBeenCalledWith(apartmentData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockApartment,
        message: 'Apartment created successfully',
      });
    });

    it('should return 400 when required fields are missing', async () => {
      mockReq.body = { unitName: 'Test Unit' }; // Missing required fields

      await apartmentController.createApartment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields',
      });
    });

    it('should handle service errors', async () => {
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

      mockReq.body = apartmentData;
      (apartmentService.createApartment as jest.Mock).mockRejectedValue(new Error('Database error'));

      await apartmentController.createApartment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create apartment',
        error: 'Internal server error',
      });
    });
  });

  describe('updateApartment', () => {
    it('should update apartment successfully', async () => {
      const updateData = { price: 160000 };
      mockReq.params = { id: 'test-id' };
      mockReq.body = updateData;
      (apartmentService.updateApartment as jest.Mock).mockResolvedValue(mockApartment);

      await apartmentController.updateApartment(mockReq as Request, mockRes as Response);

      expect(apartmentService.updateApartment).toHaveBeenCalledWith('test-id', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockApartment,
        message: 'Apartment updated successfully',
      });
    });

    it('should return 404 when apartment not found', async () => {
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { price: 160000 };
      (apartmentService.updateApartment as jest.Mock).mockResolvedValue(null);

      await apartmentController.updateApartment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Apartment not found',
      });
    });

    it('should return 400 when id is missing', async () => {
      mockReq.params = {};
      mockReq.body = { price: 160000 };

      await apartmentController.updateApartment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Apartment ID is required',
      });
    });
  });

  describe('deleteApartment', () => {
    it('should delete apartment successfully', async () => {
      mockReq.params = { id: 'test-id' };
      (apartmentService.deleteApartment as jest.Mock).mockResolvedValue(true);

      await apartmentController.deleteApartment(mockReq as Request, mockRes as Response);

      expect(apartmentService.deleteApartment).toHaveBeenCalledWith('test-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Apartment deleted successfully',
      });
    });

    it('should return 404 when apartment not found', async () => {
      mockReq.params = { id: 'non-existent-id' };
      (apartmentService.deleteApartment as jest.Mock).mockResolvedValue(false);

      await apartmentController.deleteApartment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Apartment not found',
      });
    });

    it('should return 400 when id is missing', async () => {
      mockReq.params = {};

      await apartmentController.deleteApartment(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Apartment ID is required',
      });
    });
  });

  describe('getPopularLocations', () => {
    it('should return popular locations', async () => {
      (apartmentService.getPopularLocations as jest.Mock).mockResolvedValue(mockPopularLocations);

      await apartmentController.getPopularLocations(mockReq as Request, mockRes as Response);

      expect(apartmentService.getPopularLocations).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPopularLocations,
      });
    });
  });
});
