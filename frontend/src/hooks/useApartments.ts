import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apartmentApi } from '@/services/api';
import { 
  Apartment, 
  ApartmentFilters, 
  CreateApartmentRequest 
} from '@/types/apartment';

export const apartmentKeys = {
  all: ['apartments'] as const,
  lists: () => [...apartmentKeys.all, 'list'] as const,
  list: (filters: ApartmentFilters) => [...apartmentKeys.lists(), filters] as const,
  details: () => [...apartmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...apartmentKeys.details(), id] as const,
  locations: () => [...apartmentKeys.all, 'locations'] as const,
};

export const useApartments = (filters: ApartmentFilters = {}) => {
  return useQuery({
    queryKey: apartmentKeys.list(filters),
    queryFn: () => apartmentApi.getApartments(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useApartment = (id: string) => {
  return useQuery({
    queryKey: apartmentKeys.detail(id),
    queryFn: () => apartmentApi.getApartmentById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const usePopularLocations = () => {
  return useQuery({
    queryKey: apartmentKeys.locations(),
    queryFn: () => apartmentApi.getPopularLocations(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useCreateApartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApartmentRequest) => apartmentApi.createApartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apartmentKeys.locations() });
    },
  });
};

export const useUpdateApartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateApartmentRequest> }) =>
      apartmentApi.updateApartment(id, data),
    onSuccess: (updatedApartment) => {
      queryClient.setQueryData(
        apartmentKeys.detail(updatedApartment.id),
        updatedApartment
      );
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
    },
  });
};

export const useDeleteApartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apartmentApi.deleteApartment(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: apartmentKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
    },
  });
};

