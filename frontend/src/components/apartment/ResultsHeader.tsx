'use client';

import { Loader2 } from 'lucide-react';

type ResultsHeaderProps = {
  count: number;
  isLoading?: boolean;
};

export default function ResultsHeader({ count, isLoading = false }: ResultsHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {count} {count === 1 ? 'Apartment' : 'Apartments'} Found
      </h2>
      {isLoading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      )}
    </div>
  );
}

