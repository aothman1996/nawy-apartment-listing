import axios from 'axios';
import { 
  Apartment, 
  ApartmentFilters, 
  PaginatedResponse, 
  CreateApartmentRequest 
} from '@/types/apartment';
import { 
  mapApartmentFromBackend, 
  mapApartmentToBackend,
  mapPaginatedResponse 
} from './mappers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const cleanFilters = (filters: ApartmentFilters) => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = value;
      } else if (!Array.isArray(value)) {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
};

export const apartmentApi = {
  getApartments: async (filters: ApartmentFilters = {}): Promise<PaginatedResponse<Apartment>> => {
    const response = await api.post('/apartments/search', cleanFilters(filters));
    return mapPaginatedResponse(response.data, mapApartmentFromBackend);
  },

  getApartmentById: async (id: string): Promise<Apartment> => {
    const response = await api.get(`/apartments/${id}`);
    return mapApartmentFromBackend(response.data.data);
  },

  createApartment: async (data: CreateApartmentRequest): Promise<Apartment> => {
    const backendData = mapApartmentToBackend(data as Apartment);
    const response = await api.post('/apartments', backendData);
    return mapApartmentFromBackend(response.data.data);
  },

  updateApartment: async (id: string, data: Partial<CreateApartmentRequest>): Promise<Apartment> => {
    const backendData = mapApartmentToBackend(data as Partial<Apartment>);
    const response = await api.put(`/apartments/${id}`, backendData);
    return mapApartmentFromBackend(response.data.data);
  },

  deleteApartment: async (id: string): Promise<void> => {
    await api.delete(`/apartments/${id}`);
  },

  getPopularLocations: async (): Promise<string[]> => {
    const response = await api.get(`/apartments/locations`);
    return response.data.data;
  },
};

export default api;

