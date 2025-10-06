import { ApartmentService } from '../../src/services/apartmentService';
import { prisma } from '../../src/utils/database';
import { getCache } from '../../src/utils/cache';
import {
  mockApartment,
  mockApartmentList,
  mockPaginatedResponse,
  mockCreateApartmentRequest,
  mockUpdateApartmentRequest,
  mockPopularLocations,
} from '../utils/testHelpers';

// Mock Prisma and Cache
jest.mock('../../src/utils/database');
jest.mock('../../src/utils/cache');

describe('ApartmentService', () => {
  let apartmentService: ApartmentService;
  let mockCache: any;

  beforeEach(() => {
    apartmentService = new ApartmentService();
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
    };
    (getCache as jest.Mock).mockReturnValue(mockCache);
    
    // Mock prisma.$transaction
    (prisma.$transaction as jest.Mock) = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('getApartments', () => {
    it('should return paginated apartments with filters', async () => {
      const filters = {
        search: 'test',
        minPrice: 100000,
        maxPrice: 200000,
        bedrooms: [2],
        page: 1,
        limit: 10,
        sortBy: 'price' as const,
        sortOrder: 'asc' as const,
      };

      (prisma.$transaction as jest.Mock).mockResolvedValue([mockApartmentList, 2]);

      const result = await apartmentService.getApartments(filters);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle empty filters', async () => {
      (prisma.$transaction as jest.Mock).mockResolvedValue([mockApartmentList, 2]);

      const result = await apartmentService.getApartments({});

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
    });

    it('should handle database errors', async () => {
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(apartmentService.getApartments({})).rejects.toThrow();
    });
  });

  describe('getApartmentById', () => {
    it('should return apartment from cache', async () => {
      const apartmentId = 'test-id';
      // Create a version with string dates for JSON serialization
      const mockApartmentWithStringDates = {
        ...mockApartment,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockCache.get.mockReturnValue(JSON.stringify(mockApartmentWithStringDates));

      const result = await apartmentService.getApartmentById(apartmentId);

      expect(mockCache.get).toHaveBeenCalledWith(`apartment:${apartmentId}`);
      expect(result).toEqual(mockApartmentWithStringDates);
      expect(prisma.apartment.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache when not in cache', async () => {
      const apartmentId = 'test-id';
      mockCache.get.mockReturnValue(null);
      (prisma.apartment.findUnique as jest.Mock).mockResolvedValue(mockApartment);

      const result = await apartmentService.getApartmentById(apartmentId);

      expect(mockCache.get).toHaveBeenCalledWith(`apartment:${apartmentId}`);
      expect(prisma.apartment.findUnique).toHaveBeenCalledWith({
        where: { id: apartmentId },
      });
      expect(mockCache.setEx).toHaveBeenCalledWith(
        `apartment:${apartmentId}`,
        3600,
        JSON.stringify(mockApartment)
      );
      expect(result).toEqual(mockApartment);
    });

    it('should throw NotFoundError when apartment not found', async () => {
      const apartmentId = 'non-existent-id';
      mockCache.get.mockReturnValue(null);
      (prisma.apartment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(apartmentService.getApartmentById(apartmentId)).rejects.toThrow('Apartment with ID');
    });

    it('should handle database errors', async () => {
      const apartmentId = 'test-id';
      mockCache.get.mockReturnValue(null);
      (prisma.apartment.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(apartmentService.getApartmentById(apartmentId)).rejects.toThrow();
    });
  });

  describe('createApartment', () => {
    it('should create apartment successfully', async () => {
      (prisma.apartment.create as jest.Mock).mockResolvedValue(mockApartment);

      const result = await apartmentService.createApartment(mockCreateApartmentRequest);

      expect(prisma.apartment.create).toHaveBeenCalledWith({
        data: {
          unitName: mockCreateApartmentRequest.unitName,
          unitNumber: mockCreateApartmentRequest.unitNumber,
          project: mockCreateApartmentRequest.project,
          price: mockCreateApartmentRequest.price,
          bedrooms: mockCreateApartmentRequest.bedrooms,
          bathrooms: mockCreateApartmentRequest.bathrooms,
          areaSqft: mockCreateApartmentRequest.areaSqft,
          location: mockCreateApartmentRequest.location,
          description: mockCreateApartmentRequest.description,
          images: mockCreateApartmentRequest.images || [],
          amenities: mockCreateApartmentRequest.amenities || [],
          isAvailable: mockCreateApartmentRequest.isAvailable ?? true,
        },
      });

      expect(result).toEqual(mockApartment);
    });

    it('should handle database errors', async () => {
      (prisma.apartment.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(apartmentService.createApartment(mockCreateApartmentRequest)).rejects.toThrow();
    });
  });

  describe('updateApartment', () => {
    it('should update apartment successfully', async () => {
      const apartmentId = 'test-id';
      (prisma.apartment.update as jest.Mock).mockResolvedValue(mockApartment);
      mockCache.del.mockReturnValue(1);

      const result = await apartmentService.updateApartment(apartmentId, mockUpdateApartmentRequest);

      expect(prisma.apartment.update).toHaveBeenCalledWith({
        where: { id: apartmentId },
        data: {
          price: mockUpdateApartmentRequest.price,
          description: mockUpdateApartmentRequest.description,
          isAvailable: mockUpdateApartmentRequest.isAvailable,
        },
      });

      expect(mockCache.del).toHaveBeenCalledWith(`apartment:${apartmentId}`);
      expect(result).toEqual(mockApartment);
    });

    it('should handle database errors', async () => {
      const apartmentId = 'test-id';
      (prisma.apartment.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(apartmentService.updateApartment(apartmentId, mockUpdateApartmentRequest)).rejects.toThrow();
    });
  });

  describe('deleteApartment', () => {
    it('should delete apartment successfully', async () => {
      const apartmentId = 'test-id';
      (prisma.apartment.delete as jest.Mock).mockResolvedValue(mockApartment);
      mockCache.del.mockReturnValue(1);

      const result = await apartmentService.deleteApartment(apartmentId);

      expect(prisma.apartment.delete).toHaveBeenCalledWith({
        where: { id: apartmentId },
      });

      expect(mockCache.del).toHaveBeenCalledWith(`apartment:${apartmentId}`);
      expect(result).toBe(true);
    });

    it('should handle database errors', async () => {
      const apartmentId = 'test-id';
      (prisma.apartment.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(apartmentService.deleteApartment(apartmentId)).rejects.toThrow();
    });
  });

  describe('searchApartments', () => {
    it('should search apartments by text', async () => {
      const query = 'test search';
      const limit = 5;
      (prisma.apartment.findMany as jest.Mock).mockResolvedValue(mockApartmentList);

      const result = await apartmentService.searchApartments(query, limit);

      expect(prisma.apartment.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { unitName: { contains: query, mode: 'insensitive' } },
            { unitNumber: { contains: query, mode: 'insensitive' } },
            { project: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual(mockApartmentList);
    });

    it('should use default limit when not provided', async () => {
      const query = 'test search';
      (prisma.apartment.findMany as jest.Mock).mockResolvedValue(mockApartmentList);

      await apartmentService.searchApartments(query);

      expect(prisma.apartment.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { unitName: { contains: query, mode: 'insensitive' } },
            { unitNumber: { contains: query, mode: 'insensitive' } },
            { project: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database errors', async () => {
      const query = 'test search';
      (prisma.apartment.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(apartmentService.searchApartments(query)).rejects.toThrow();
    });
  });

  describe('getPopularLocations', () => {
    it('should return all locations sorted alphabetically', async () => {
      const mockGroupByResult = [
        { location: 'Another City', _count: { location: 3 } },
        { location: 'Test City', _count: { location: 5 } },
      ];
      (prisma.apartment.groupBy as jest.Mock).mockResolvedValue(mockGroupByResult);
      mockCache.get.mockReturnValue(null);

      const result = await apartmentService.getPopularLocations();

      expect(prisma.apartment.groupBy).toHaveBeenCalledWith({
        by: ['location'],
        _count: { location: true },
        orderBy: { location: 'asc' },
      });

      expect(result).toEqual(['Another City', 'Test City']);
      expect(mockCache.setEx).toHaveBeenCalled();
    });

    it('should return cached locations when available', async () => {
      const cachedLocations = JSON.stringify(['Cached City 1', 'Cached City 2']);
      mockCache.get.mockReturnValue(cachedLocations);

      const result = await apartmentService.getPopularLocations();

      expect(prisma.apartment.groupBy).not.toHaveBeenCalled();
      expect(result).toEqual(['Cached City 1', 'Cached City 2']);
    });

    it('should handle database errors', async () => {
      mockCache.get.mockReturnValue(null);
      (prisma.apartment.groupBy as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(apartmentService.getPopularLocations()).rejects.toThrow();
    });
  });
});
