import { render, screen } from '@testing-library/react';
import ApartmentCard from '../apartment/ApartmentCard';
import { Apartment } from '@/types/apartment';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockApartment: Apartment = {
  id: '1',
  unitName: 'Luxury Apartment',
  unitNumber: 'A101',
  project: 'Test Project',
  price: 150000,
  bedrooms: 2,
  bathrooms: 2,
  areaSqft: 1200,
  location: 'Test City',
  description: 'A beautiful apartment',
  images: ['https://example.com/image1.jpg'],
  amenities: ['Pool', 'Gym', 'Parking'],
  isAvailable: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ApartmentCard', () => {
  it('renders apartment information correctly', () => {
    render(<ApartmentCard apartment={mockApartment} />);

    expect(screen.getByText('Luxury Apartment')).toBeVisible();
    expect(screen.getByText('Test Project • Unit A101')).toBeVisible();
    expect(screen.getByText('Test City')).toBeVisible();
    expect(screen.getByText('2 beds')).toBeVisible();
    expect(screen.getByText('2 baths')).toBeVisible();
    expect(screen.getByText('1,200 sq ft')).toBeVisible();
  });

  it('displays price correctly', () => {
    render(<ApartmentCard apartment={mockApartment} />);
    expect(screen.getByText('$150,000')).toBeVisible();
  });

  it('shows available status for available apartment', () => {
    render(<ApartmentCard apartment={mockApartment} />);
    expect(screen.getByText('Available')).toBeVisible();
  });

  it('shows unavailable status for unavailable apartment', () => {
    const unavailableApartment = { ...mockApartment, isAvailable: false };
    render(<ApartmentCard apartment={unavailableApartment} />);
    expect(screen.getByText('Unavailable')).toBeVisible();
  });

  it('displays amenities correctly', () => {
    render(<ApartmentCard apartment={mockApartment} />);
    expect(screen.getByText('Pool')).toBeVisible();
    expect(screen.getByText('Gym')).toBeVisible();
    expect(screen.getByText('Parking')).toBeVisible();
  });

  it('shows "more" indicator when there are more than 4 amenities', () => {
    const apartmentWithManyAmenities = {
      ...mockApartment,
      amenities: ['Pool', 'Gym', 'Parking', 'Spa', 'Library']
    };
    render(<ApartmentCard apartment={apartmentWithManyAmenities} />);
    expect(screen.getByText('+1 more')).toBeVisible();
  });

  it('displays placeholder when no image is provided', () => {
    const apartmentWithoutImages = { ...mockApartment, images: [] };
    render(<ApartmentCard apartment={apartmentWithoutImages} />);
    expect(screen.getByText('No Image')).toBeVisible();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <ApartmentCard apartment={mockApartment} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies opacity to unavailable apartments', () => {
    const unavailableApartment = { ...mockApartment, isAvailable: false };
    const { container } = render(<ApartmentCard apartment={unavailableApartment} />);
    expect(container.firstChild).toHaveClass('opacity-75');
  });

  it('has correct link to apartment details', () => {
    render(<ApartmentCard apartment={mockApartment} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/apartments/1');
  });

  it('displays view details button', () => {
    render(<ApartmentCard apartment={mockApartment} />);
    expect(screen.getByText('View Details')).toBeVisible();
  });
});
