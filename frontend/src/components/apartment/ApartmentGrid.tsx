'use client';

import { Grid } from 'lucide-react';
import { Apartment } from '@/types/apartment';
import ApartmentCard from './ApartmentCard';
import { ApartmentGridSkeleton } from '@/components/ui/Skeleton';

type ApartmentGridProps = {
  apartments: Apartment[];
  isLoading?: boolean;
  onClearFilters?: () => void;
};

export default function ApartmentGrid({ 
  apartments, 
  isLoading = false,
  onClearFilters 
}: ApartmentGridProps) {
  // Loading state with skeleton
  if (isLoading) {
    return <ApartmentGridSkeleton count={6} />;
  }

  // Empty state
  if (apartments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Grid className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Apartments Found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search criteria or filters to find more apartments.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  // Grid with apartments
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {apartments.map((apartment) => (
        <ApartmentCard
          key={apartment.id}
          apartment={apartment}
        />
      ))}
    </div>
  );
}

