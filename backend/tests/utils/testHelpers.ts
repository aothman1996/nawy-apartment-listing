import { ApartmentResponse, CreateApartmentRequest, UpdateApartmentRequest } from '../../src/types/apartment';

export const mockApartment: ApartmentResponse = {
  id: 'test-apartment-id',
  unitName: 'Test Unit',
  unitNumber: 'A101',
  project: 'Test Project',
  price: 150000,
  bedrooms: 2,
  bathrooms: 2,
  areaSqft: 1200,
  location: 'Test City',
  description: 'A beautiful test apartment',
  images: ['https://example.com/image1.jpg'],
  amenities: ['Pool', 'Gym'],
  isAvailable: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockCreateApartmentRequest: CreateApartmentRequest = {
  unitName: 'Test Unit',
  unitNumber: 'A101',
  project: 'Test Project',
  price: 150000,
  bedrooms: 2,
  bathrooms: 2,
  areaSqft: 1200,
  location: 'Test City',
  description: 'A beautiful test apartment',
  images: ['https://example.com/image1.jpg'],
  amenities: ['Pool', 'Gym'],
  isAvailable: true,
};

export const mockUpdateApartmentRequest: UpdateApartmentRequest = {
  price: 160000,
  description: 'Updated description',
  isAvailable: false,
};

export const mockApartmentList: ApartmentResponse[] = [
  mockApartment,
  {
    ...mockApartment,
    id: 'test-apartment-id-2',
    unitName: 'Test Unit 2',
    unitNumber: 'A102',
    price: 200000,
  },
];

export const mockPaginatedResponse = {
  data: mockApartmentList,
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

export const createMockRequest = () => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  ip: '127.0.0.1',
  url: '/test',
  method: 'GET',
  get: jest.fn(),
});

export const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
});

export const createMockNext = () => jest.fn();

export const mockPopularLocations = ['Test City', 'Another City', 'Third City'];
