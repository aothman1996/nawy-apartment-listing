export type CreateApartmentRequest = {
  unitName: string;
  unitNumber: string;
  project: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  location: string;
  description?: string;
  images?: string[];
  amenities?: string[];
  isAvailable?: boolean;
};

export type UpdateApartmentRequest = {
  unitName?: string;
  unitNumber?: string;
  project?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  location?: string;
  description?: string;
  images?: string[];
  amenities?: string[];
  isAvailable?: boolean;
};

export type ApartmentFilters = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number[];
  bathrooms?: number[];
  locations?: string[];
  amenities?: string[];
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt' | 'areaSqft' | 'bedrooms' | 'bathrooms';
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
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

export type ApartmentResponse = {
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
  createdAt: Date;
  updatedAt: Date;
};

