import { Apartment, PaginatedResponse } from '@/types/apartment';

type BackendApartment = {
  id: string;
  unitName: string;
  unitNumber: string;
  project: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  location: string;
  description?: string;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

type BackendPaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const mapApartmentFromBackend = (backend: BackendApartment): Apartment => ({
  id: backend.id,
  unitName: backend.unitName,
  unitNumber: backend.unitNumber,
  project: backend.project,
  price: backend.price,
  bedrooms: backend.bedrooms,
  bathrooms: backend.bathrooms,
  areaSqft: backend.areaSqft,
  location: backend.location,
  description: backend.description,
  images: backend.images,
  amenities: backend.amenities,
  isAvailable: backend.isAvailable,
  createdAt: backend.createdAt,
  updatedAt: backend.updatedAt,
});

export const mapApartmentToBackend = (apartment: Partial<Apartment>): Partial<BackendApartment> => ({
  unitName: apartment.unitName,
  unitNumber: apartment.unitNumber,
  project: apartment.project,
  price: apartment.price,
  bedrooms: apartment.bedrooms,
  bathrooms: apartment.bathrooms,
  areaSqft: apartment.areaSqft,
  location: apartment.location,
  description: apartment.description,
  images: apartment.images,
  amenities: apartment.amenities,
  isAvailable: apartment.isAvailable,
});

export const mapPaginatedResponse = <T, U>(
  backendResponse: BackendPaginatedResponse<T>,
  mapper: (item: T) => U
): PaginatedResponse<U> => ({
  data: backendResponse.data.map(mapper),
  pagination: backendResponse.pagination,
});
