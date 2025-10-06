// Filter constants for apartment search

export const BEDROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' }
] as const;

export const BATHROOM_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' }
] as const;

export const AMENITY_OPTIONS = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Security',
  'Garden',
  'Balcony',
  'Central AC',
  'Built-in Wardrobes',
  'Maid\'s Room',
  'Study Room',
  'Storage Room',
  'Kitchen Appliances',
  'Pets Allowed',
  'Concierge Service',
  'Children\'s Play Area',
  'BBQ Area',
  'Spa',
  'Tennis Court',
  'Beach Access',
  'Smart Home'
] as const;

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'price', label: 'Price' },
  { value: 'areaSqft', label: 'Area' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'bathrooms', label: 'Bathrooms' }
] as const;

export const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' }
] as const;

export const DEFAULT_FILTERS = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt' as const,
  sortOrder: 'desc' as const,
  minPrice: undefined,
  maxPrice: undefined,
  minArea: undefined,
  maxArea: undefined,
  bedrooms: [],
  bathrooms: [],
  locations: [],
  amenities: []
};

export const DEBOUNCE_DELAY = 800; // milliseconds - increased for price/area inputs

