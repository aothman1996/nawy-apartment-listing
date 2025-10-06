'use client';

import { useState, useCallback } from 'react';
import { useApartments, usePopularLocations } from '@/hooks/useApartments';
import { ApartmentFilters } from '@/types/apartment';
import SearchFilters from '@/components/apartment/SearchFilters';
import ApartmentGrid from '@/components/apartment/ApartmentGrid';
import ResultsHeader from '@/components/apartment/ResultsHeader';
import PaginationControls from '@/components/apartment/PaginationControls';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_FILTERS } from '@/constants/filters';

export default function HomePage() {
  const [filters, setFilters] = useState<ApartmentFilters>(DEFAULT_FILTERS);

  const { data: apartmentsData, isLoading, error } = useApartments(filters);
  const { data: popularLocations = [] } = usePopularLocations();

  // Memoize handlers to prevent unnecessary re-renders
  const handleFiltersChange = useCallback((newFilters: ApartmentFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Apartments</h2>
          <p className="text-gray-600 mb-4">There was a problem loading the apartments. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Apartment</h1>
          <p className="text-gray-600">
            Discover amazing apartments across the city with our comprehensive search and filtering options.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            popularLocations={popularLocations}
          />
        </div>

        {/* Results Header */}
        <ResultsHeader 
          count={apartmentsData?.pagination.total || 0}
          isLoading={isLoading}
        />

        {/* Apartments Grid */}
        <ApartmentGrid
          apartments={apartmentsData?.data || []}
          isLoading={isLoading}
          onClearFilters={handleClearFilters}
        />

        {/* Pagination */}
        {apartmentsData?.data && apartmentsData.data.length > 0 && (
          <PaginationControls
            currentPage={filters.page || 1}
            totalPages={apartmentsData.pagination.totalPages}
            hasNext={apartmentsData.pagination.hasNext}
            hasPrev={apartmentsData.pagination.hasPrev}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}