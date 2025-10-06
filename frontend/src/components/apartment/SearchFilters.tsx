'use client';

import { useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ApartmentFilters } from '@/types/apartment';
import { cn } from '@/utils/cn';
import { 
  BEDROOM_OPTIONS, 
  BATHROOM_OPTIONS, 
  DEFAULT_FILTERS, 
  DEBOUNCE_DELAY,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  AMENITY_OPTIONS
} from '@/constants/filters';

type SearchFiltersProps = {
  filters: ApartmentFilters;
  onFiltersChange: (filters: ApartmentFilters) => void;
  popularLocations?: string[];
  className?: string;
};

type MultiSelectOption = {
  value: string | number;
  label: string;
};

type UIState = {
  isExpanded: boolean;
  localFilters: ApartmentFilters;
  searchValue: string;
  priceValues: { minPrice: string; maxPrice: string };
  areaValues: { minArea: string; maxArea: string };
  isSearching: boolean;
  dropdowns: {
    bedroom: boolean;
    bathroom: boolean;
    location: boolean;
    amenity: boolean;
  };
  dropdownSearch: {
    location: string;
    amenity: string;
  };
};

type UIAction =
  | { type: 'TOGGLE_EXPANDED' }
  | { type: 'SET_FILTERS'; payload: ApartmentFilters }
  | { type: 'SET_SEARCH_VALUE'; payload: string }
  | { type: 'SET_PRICE_VALUES'; payload: Partial<UIState['priceValues']> }
  | { type: 'SET_AREA_VALUES'; payload: Partial<UIState['areaValues']> }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'TOGGLE_DROPDOWN'; payload: keyof UIState['dropdowns'] }
  | { type: 'CLOSE_ALL_DROPDOWNS' }
  | { type: 'SET_DROPDOWN_SEARCH'; payload: { key: keyof UIState['dropdownSearch']; value: string } }
  | { type: 'RESET_FILTERS' };

const initialState = (filters: ApartmentFilters): UIState => ({
  isExpanded: false,
  localFilters: filters,
  searchValue: filters.search || '',
  priceValues: {
    minPrice: filters.minPrice?.toString() || '',
    maxPrice: filters.maxPrice?.toString() || '',
  },
  areaValues: {
    minArea: filters.minArea?.toString() || '',
    maxArea: filters.maxArea?.toString() || '',
  },
  isSearching: false,
  dropdowns: {
    bedroom: false,
    bathroom: false,
    location: false,
    amenity: false,
  },
  dropdownSearch: {
    location: '',
    amenity: '',
  },
});

const reducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_EXPANDED':
      return { ...state, isExpanded: !state.isExpanded };
    case 'SET_FILTERS':
      return {
        ...state,
        localFilters: action.payload,
        searchValue: action.payload.search || '',
        priceValues: {
          minPrice: action.payload.minPrice?.toString() || '',
          maxPrice: action.payload.maxPrice?.toString() || '',
        },
        areaValues: {
          minArea: action.payload.minArea?.toString() || '',
          maxArea: action.payload.maxArea?.toString() || '',
        },
      };
    case 'SET_SEARCH_VALUE':
      return { ...state, searchValue: action.payload };
    case 'SET_PRICE_VALUES':
      return { ...state, priceValues: { ...state.priceValues, ...action.payload } };
    case 'SET_AREA_VALUES':
      return { ...state, areaValues: { ...state.areaValues, ...action.payload } };
    case 'SET_IS_SEARCHING':
      return { ...state, isSearching: action.payload };
    case 'TOGGLE_DROPDOWN':
      return {
        ...state,
        dropdowns: {
          ...Object.fromEntries(Object.keys(state.dropdowns).map(k => [k, false])),
          [action.payload]: !state.dropdowns[action.payload],
        } as UIState['dropdowns'],
      };
    case 'CLOSE_ALL_DROPDOWNS':
      return {
        ...state,
        dropdowns: {
          bedroom: false,
          bathroom: false,
          location: false,
          amenity: false,
        },
        dropdownSearch: {
          location: '',
          amenity: '',
        },
      };
    case 'SET_DROPDOWN_SEARCH':
      return {
        ...state,
        dropdownSearch: { ...state.dropdownSearch, [action.payload.key]: action.payload.value },
      };
    case 'RESET_FILTERS':
      return initialState(DEFAULT_FILTERS);
    default:
      return state;
  }
};

const useDebounce = (value: string | Record<string, string>, delay: number, callback: () => void) => {
  useEffect(() => {
    const timeoutId = setTimeout(callback, delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay, callback]);
};

export default function SearchFilters({ 
  filters, 
  onFiltersChange, 
  popularLocations = [],
  className 
}: SearchFiltersProps) {
  const [state, dispatch] = useReducer(reducer, filters, initialState);
  
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  
  const bedroomRef = useRef<HTMLDivElement>(null);
  const bathroomRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const amenityRef = useRef<HTMLDivElement>(null);

  const locationOptions: MultiSelectOption[] = useMemo(
    () => popularLocations.map(loc => ({ value: loc, label: loc })),
    [popularLocations]
  );

  const filteredLocationOptions = useMemo(
    () => locationOptions.filter(option =>
      option.label.toLowerCase().includes(state.dropdownSearch.location.toLowerCase())
    ),
    [locationOptions, state.dropdownSearch.location]
  );

  const filteredAmenityOptions = useMemo(
    () => AMENITY_OPTIONS.filter(amenity =>
      amenity.toLowerCase().includes(state.dropdownSearch.amenity.toLowerCase())
    ),
    [state.dropdownSearch.amenity]
  );

  const handleFilterChange = useCallback((key: keyof ApartmentFilters, value: unknown) => {
    const newFilters = { ...filtersRef.current, [key]: value };
    if (key !== 'page') {
      newFilters.page = 1;
    }
    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  const handleSearchDebounce = useCallback(() => {
    if (state.searchValue !== filtersRef.current.search) {
      handleFilterChange('search', state.searchValue || undefined);
      dispatch({ type: 'SET_IS_SEARCHING', payload: false });
    }
  }, [state.searchValue, handleFilterChange]);

  const handlePriceDebounce = useCallback(() => {
    const minPrice = state.priceValues.minPrice ? Number(state.priceValues.minPrice) : undefined;
    const maxPrice = state.priceValues.maxPrice ? Number(state.priceValues.maxPrice) : undefined;
    
    if (minPrice !== filtersRef.current.minPrice || maxPrice !== filtersRef.current.maxPrice) {
      const newFilters = { ...filtersRef.current, minPrice, maxPrice, page: 1 };
      onFiltersChange(newFilters);
    }
  }, [state.priceValues, onFiltersChange]);

  const handleAreaDebounce = useCallback(() => {
    const minArea = state.areaValues.minArea ? Number(state.areaValues.minArea) : undefined;
    const maxArea = state.areaValues.maxArea ? Number(state.areaValues.maxArea) : undefined;
    
    if (minArea !== filtersRef.current.minArea || maxArea !== filtersRef.current.maxArea) {
      const newFilters = { ...filtersRef.current, minArea, maxArea, page: 1 };
      onFiltersChange(newFilters);
    }
  }, [state.areaValues, onFiltersChange]);

  useDebounce(state.searchValue, DEBOUNCE_DELAY, handleSearchDebounce);
  useDebounce(JSON.stringify(state.priceValues), DEBOUNCE_DELAY, handlePriceDebounce);
  useDebounce(JSON.stringify(state.areaValues), DEBOUNCE_DELAY, handleAreaDebounce);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refs = [
        { ref: bedroomRef, key: 'bedroom' as const },
        { ref: bathroomRef, key: 'bathroom' as const },
        { ref: locationRef, key: 'location' as const },
        { ref: amenityRef, key: 'amenity' as const },
      ];

      refs.forEach(({ ref, key }) => {
        if (ref.current && !ref.current.contains(event.target as Node) && state.dropdowns[key]) {
          dispatch({ type: 'CLOSE_ALL_DROPDOWNS' });
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.dropdowns]);

  const handleMultiSelectChange = useCallback((
    key: 'bedrooms' | 'bathrooms' | 'locations' | 'amenities',
    value: string | number
  ) => {
    const currentValues = (filtersRef.current[key] || []) as (string | number)[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(key, newValues.length > 0 ? newValues : undefined);
  }, [handleFilterChange]);

  const clearFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page' || key === 'limit' || key === 'sortBy' || key === 'sortOrder') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-4', className)}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          {state.isSearching ? (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          )}
          <input
            type="text"
            placeholder="Search apartments by name, project, or location..."
            value={state.searchValue}
            onChange={(e) => {
              dispatch({ type: 'SET_SEARCH_VALUE', payload: e.target.value });
              dispatch({ type: 'SET_IS_SEARCHING', payload: true });
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
          />
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_EXPANDED' })}
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer',
            state.isExpanded 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          )}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {state.isExpanded && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Price Range (USD)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Min Price (USD)"
                  value={state.priceValues.minPrice}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    dispatch({ type: 'SET_PRICE_VALUES', payload: { minPrice: value } });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                />
                <input
                  type="text"
                  placeholder="Max Price (USD)"
                  value={state.priceValues.maxPrice}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    dispatch({ type: 'SET_PRICE_VALUES', payload: { maxPrice: value } });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Area Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Area (sq ft)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Min Area"
                  value={state.areaValues.minArea}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    dispatch({ type: 'SET_AREA_VALUES', payload: { minArea: value } });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                />
                <input
                  type="text"
                  placeholder="Max Area"
                  value={state.areaValues.maxArea}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    dispatch({ type: 'SET_AREA_VALUES', payload: { maxArea: value } });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Bedrooms Multi-Select */}
            <div className="relative" ref={bedroomRef}>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Number of Bedrooms
              </label>
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_DROPDOWN', payload: 'bedroom' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between text-gray-900"
              >
                <span>
                  {filters.bedrooms && filters.bedrooms.length > 0
                    ? `${filters.bedrooms.length} selected`
                    : 'Any bedrooms'
                  }
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {state.dropdowns.bedroom && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-scroll">
                  {BEDROOM_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.bedrooms?.includes(option.value as number) || false}
                        onChange={() => handleMultiSelectChange('bedrooms', option.value)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Bathrooms Multi-Select */}
            <div className="relative" ref={bathroomRef}>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Number of Bathrooms
              </label>
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_DROPDOWN', payload: 'bathroom' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between text-gray-900"
              >
                <span>
                  {filters.bathrooms && filters.bathrooms.length > 0
                    ? `${filters.bathrooms.length} selected`
                    : 'Any bathrooms'
                  }
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {state.dropdowns.bathroom && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-scroll">
                  {BATHROOM_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.bathrooms?.includes(option.value as number) || false}
                        onChange={() => handleMultiSelectChange('bathrooms', option.value)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Location Multi-Select */}
            <div className="relative" ref={locationRef}>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Select Locations
              </label>
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_DROPDOWN', payload: 'location' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between text-gray-900"
              >
                <span>
                  {filters.locations && filters.locations.length > 0
                    ? `${filters.locations.length} selected`
                    : 'Any location'
                  }
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {state.dropdowns.location && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <input
                      type="text"
                      placeholder="Search locations..."
                      value={state.dropdownSearch.location}
                      onChange={(e) =>
                        dispatch({ type: 'SET_DROPDOWN_SEARCH', payload: { key: 'location', value: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-scroll">
                    {filteredLocationOptions.length > 0 ? (
                      filteredLocationOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.locations?.includes(option.value as string) || false}
                            onChange={() => handleMultiSelectChange('locations', option.value)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-800">{option.label}</span>
                        </label>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-gray-500">
                        No locations found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Amenities Multi-Select */}
            <div className="relative" ref={amenityRef}>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Select Amenities
              </label>
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_DROPDOWN', payload: 'amenity' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between text-gray-900"
              >
                <span>
                  {filters.amenities && filters.amenities.length > 0
                    ? `${filters.amenities.length} selected`
                    : 'Any amenities'
                  }
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {state.dropdowns.amenity && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <input
                      type="text"
                      placeholder="Search amenities..."
                      value={state.dropdownSearch.amenity}
                      onChange={(e) =>
                        dispatch({ type: 'SET_DROPDOWN_SEARCH', payload: { key: 'amenity', value: e.target.value } })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-scroll">
                    {filteredAmenityOptions.length > 0 ? (
                      filteredAmenityOptions.map((amenity) => (
                        <label
                          key={amenity}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.amenities?.includes(amenity) || false}
                            onChange={() => handleMultiSelectChange('amenities', amenity)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-800">{amenity}</span>
                        </label>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-gray-500">
                        No amenities found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Order:</label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                {SORT_ORDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}