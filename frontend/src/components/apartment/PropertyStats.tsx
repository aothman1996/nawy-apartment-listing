'use client';

import React from 'react';
import { Bed, Bath, Square } from 'lucide-react';
import { formatArea } from '@/utils/format';

type PropertyStatsProps = {
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  variant?: 'default' | 'compact';
  className?: string;
};

function PropertyStats({ 
  bedrooms, 
  bathrooms, 
  areaSqft,
  variant = 'default',
  className = ''
}: PropertyStatsProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-4 text-sm ${className}`}>
        <div className="flex items-center text-gray-600">
          <Bed className="w-4 h-4 mr-1" />
          <span>{bedrooms} bed</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Bath className="w-4 h-4 mr-1" />
          <span>{bathrooms} bath</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Square className="w-4 h-4 mr-1" />
          <span>{formatArea(areaSqft)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-6 text-sm text-gray-700 ${className}`}>
      <div className="flex items-center">
        <Bed className="w-5 h-5 mr-2 text-gray-600" />
        <span className="font-semibold">{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center">
        <Bath className="w-5 h-5 mr-2 text-gray-600" />
        <span className="font-semibold">{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center">
        <Square className="w-5 h-5 mr-2 text-gray-600" />
        <span className="font-semibold">{formatArea(areaSqft)}</span>
      </div>
    </div>
  );
}

export default PropertyStats;

