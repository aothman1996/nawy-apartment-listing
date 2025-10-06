'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Eye } from 'lucide-react';
import { Apartment } from '@/types/apartment';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';
import PropertyStats from './PropertyStats';

type ApartmentCardProps = {
  apartment: Apartment;
  className?: string;
};

function ApartmentCard({ apartment, className }: ApartmentCardProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const {
    id,
    unitName,
    unitNumber,
    project,
    price,
    bedrooms,
    bathrooms,
    areaSqft,
    location,
    images,
    amenities,
    isAvailable
  } = apartment;

  const handleToggleAmenities = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAllAmenities(!showAllAmenities);
  };

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col',
      !isAvailable && 'opacity-75',
      className
    )}>
      {/* Image */}
      <div className="relative h-64 w-full">
        {images && images.length > 0 ? (
          <Image
            src={images[0]}
            alt={unitName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-semibold">
            {formatPrice(price)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title and Project */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-1">
            {unitName}
          </h3>
          <p className="text-sm font-medium text-gray-700">
            {project} • Unit {unitNumber}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-700 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-gray-600" />
          <span className="text-sm font-medium">{location}</span>
        </div>

        {/* Details */}
        <div className="mb-5">
          <PropertyStats
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            areaSqft={areaSqft}
          />
        </div>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="mb-5 flex-grow">
            <div className="flex flex-wrap gap-2 transition-all duration-300">
              {(showAllAmenities ? amenities : amenities.slice(0, 4)).map((amenity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold border border-blue-200"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 4 && (
                <span 
                  onClick={handleToggleAmenities}
                  className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full font-semibold border border-gray-300 cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  {showAllAmenities ? 'Show less' : `+${amenities.length - 4} more`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <Link
            href={`/apartments/${id}`}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ApartmentCard;

