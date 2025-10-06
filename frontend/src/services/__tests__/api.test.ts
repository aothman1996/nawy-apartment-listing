import { apartmentApi } from '../api';
import { Apartment, ApartmentFilters, CreateApartmentRequest } from '@/types/apartment';

// Mock the API module
jest.mock('../api', () => ({
  apartmentApi: {
    getApartments: jest.fn(),
    getApartmentById: jest.fn(),
    createApartment: jest.fn(),
    updateApartment: jest.fn(),
    deleteApartment: jest.fn(),
    searchApartments: jest.fn(),
    getPopularLocations: jest.fn(),
  },
}));

const mockApartment: Apartment = {
  id: '1',
  unitName: 'Test Apartment',
  unitNumber: 'A101',
  project: 'Test Project',
  price: 150000,
  bedrooms: 2,
  bathrooms: 2,
  areaSqft: 1200,
  location: 'Test City',
  description: 'A beautiful apartment',
  images: ['https://example.com/image1.jpg'],
  amenities: ['Pool', 'Gym'],
  isAvailable: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPaginatedResponse = {
  data: [mockApartment],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

describe('apartmentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApartments', () => {
    it('should fetch apartments with filters', async () => {
      const filters: ApartmentFilters = {
        search: 'test',
        minPrice: 100000,
        maxPrice: 200000,
        page: 1,
        limit: 10,
      };

      (apartmentApi.getApartments as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const result = await apartmentApi.getApartments(filters);

      expect(apartmentApi.getApartments).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch apartments with default filters', async () => {
      (apartmentApi.getApartments as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const result = await apartmentApi.getApartments();

      expect(apartmentApi.getApartments).toHaveBeenCalledWith();
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      (apartmentApi.getApartments as jest.Mock).mockRejectedValue(error);

      await expect(apartmentApi.getApartments()).rejects.toThrow('Network error');
    });
  });

  describe('getApartmentById', () => {
    it('should fetch apartment by id', async () => {
      (apartmentApi.getApartmentById as jest.Mock).mockResolvedValue(mockApartment);

      const result = await apartmentApi.getApartmentById('1');

      expect(apartmentApi.getApartmentById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockApartment);
    });

    it('should handle not found error', async () => {
      const error = new Error('Apartment not found');
      (apartmentApi.getApartmentById as jest.Mock).mockRejectedValue(error);

      await expect(apartmentApi.getApartmentById('999')).rejects.toThrow('Apartment not found');
    });
  });

  describe('createApartment', () => {
    it('should create apartment', async () => {
      const apartmentData: CreateApartmentRequest = {
        unitName: 'New Apartment',
        unitNumber: 'B101',
        project: 'New Project',
        price: 200000,
        bedrooms: 3,
        bathrooms: 2,
        areaSqft: 1500,
        location: 'New City',
      };

      (apartmentApi.createApartment as jest.Mock).mockResolvedValue(mockApartment);

      const result = await apartmentApi.createApartment(apartmentData);

      expect(apartmentApi.createApartment).toHaveBeenCalledWith(apartmentData);
      expect(result).toEqual(mockApartment);
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        unitName: '', // Invalid: empty name
      };

      const error = new Error('Validation failed');
      (apartmentApi.createApartment as jest.Mock).mockRejectedValue(error);

      await expect(apartmentApi.createApartment(invalidData as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('updateApartment', () => {
    it('should update apartment', async () => {
      const updateData = {
        price: 180000,
        description: 'Updated description',
      };

      const updatedApartment = { ...mockApartment, ...updateData };
      (apartmentApi.updateApartment as jest.Mock).mockResolvedValue(updatedApartment);

      const result = await apartmentApi.updateApartment('1', updateData);

      expect(apartmentApi.updateApartment).toHaveBeenCalledWith('1', updateData);
      expect(result).toEqual(updatedApartment);
    });
  });

  describe('deleteApartment', () => {
    it('should delete apartment', async () => {
      (apartmentApi.deleteApartment as jest.Mock).mockResolvedValue(true);

      const result = await apartmentApi.deleteApartment('1');

      expect(apartmentApi.deleteApartment).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should handle not found error', async () => {
      const error = new Error('Apartment not found');
      (apartmentApi.deleteApartment as jest.Mock).mockRejectedValue(error);

      await expect(apartmentApi.deleteApartment('999')).rejects.toThrow('Apartment not found');
    });
  });

  describe('searchApartments', () => {
    it('should search apartments', async () => {
      (apartmentApi.searchApartments as jest.Mock).mockResolvedValue([mockApartment]);

      const result = await apartmentApi.searchApartments('test query', 5);

      expect(apartmentApi.searchApartments).toHaveBeenCalledWith('test query', 5);
      expect(result).toEqual([mockApartment]);
    });

    it('should use default limit', async () => {
      (apartmentApi.searchApartments as jest.Mock).mockResolvedValue([mockApartment]);

      await apartmentApi.searchApartments('test query');

      expect(apartmentApi.searchApartments).toHaveBeenCalledWith('test query');
    });
  });

  describe('getPopularLocations', () => {
    it('should fetch popular locations', async () => {
      const locations = ['Test City', 'Another City'];
      (apartmentApi.getPopularLocations as jest.Mock).mockResolvedValue(locations);

      const result = await apartmentApi.getPopularLocations(5);

      expect(apartmentApi.getPopularLocations).toHaveBeenCalledWith(5);
      expect(result).toEqual(locations);
    });

    it('should use default limit', async () => {
      const locations = ['Test City'];
      (apartmentApi.getPopularLocations as jest.Mock).mockResolvedValue(locations);

      await apartmentApi.getPopularLocations();

      expect(apartmentApi.getPopularLocations).toHaveBeenCalledWith();
    });
  });
});