'use client';

import React from 'react';

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
};

function PaginationControls({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
                   hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 
                   transition-colors duration-200 cursor-pointer"
      >
        Previous
      </button>
      
      <div className="flex items-center space-x-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                currentPage === page
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
                   hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 
                   transition-colors duration-200 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}

export default PaginationControls;

