import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilters from '../apartment/SearchFilters';
import { ApartmentFilters } from '@/types/apartment';

const mockFilters: ApartmentFilters = {
  page: 1,
  limit: 12,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const mockPopularLocations = ['Test City', 'Another City', 'Third City'];

describe('SearchFilters', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input and filters button', () => {
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    expect(screen.getByPlaceholderText('Search apartments by name, project, or location...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('handles search input changes', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search apartments by name, project, or location...');
    await user.type(searchInput, 'test search');

    // Fast-forward debounce timer (800ms)
    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test search',
          page: 1,
        })
      );
    });

    jest.useRealTimers();
  });

  it('toggles filters expansion', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    expect(screen.getByText('Price Range (USD)')).toBeInTheDocument();
    expect(screen.getByText('Number of Bedrooms')).toBeInTheDocument();
    expect(screen.getByText('Number of Bathrooms')).toBeInTheDocument();
    expect(screen.getByText('Select Locations')).toBeInTheDocument();
  });

  it('handles price range changes', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    // Expand filters first
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    const minPriceInput = screen.getByPlaceholderText('Min Price (USD)');
    const maxPriceInput = screen.getByPlaceholderText('Max Price (USD)');

    // Type both values before debounce triggers
    await user.type(minPriceInput, '100000');
    await user.type(maxPriceInput, '200000');
    
    // Fast-forward debounce timer
    jest.advanceTimersByTime(800);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          minPrice: 100000,
          maxPrice: 200000,
          page: 1,
        })
      );
    });

    jest.useRealTimers();
  });

  it('handles bedroom selection', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    // Expand filters first
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    const bedroomButton = screen.getByText('Any bedrooms');
    await user.click(bedroomButton);

    const bedroom2Checkbox = screen.getByRole('checkbox', { name: '2' });
    await user.click(bedroom2Checkbox);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          bedrooms: [2],
          page: 1,
        })
      );
    });
  });

  it('handles bathroom selection', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    // Expand filters first
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    const bathroomButton = screen.getByText('Any bathrooms');
    await user.click(bathroomButton);

    const bathroom2Checkbox = screen.getByRole('checkbox', { name: '2' });
    await user.click(bathroom2Checkbox);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          bathrooms: [2],
          page: 1,
        })
      );
    });
  });

  it('handles location selection', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    // Expand filters first
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    const locationButton = screen.getByText('Any location');
    await user.click(locationButton);

    const testCityCheckbox = screen.getByRole('checkbox', { name: 'Test City' });
    await user.click(testCityCheckbox);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          locations: ['Test City'],
          page: 1,
        })
      );
    });
  });

  it('handles sort options', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    // Expand filters first
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    const sortBySelect = screen.getByDisplayValue('Date Added');
    await user.selectOptions(sortBySelect, 'price');

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'price',
          page: 1,
        })
      );
    });
  });

  it('shows clear button when filters are active', () => {
    const filtersWithValues: ApartmentFilters = {
      ...mockFilters,
      search: 'test',
      minPrice: 100000,
    };

    render(
      <SearchFilters
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const filtersWithValues: ApartmentFilters = {
      ...mockFilters,
      search: 'test',
      minPrice: 100000,
    };

    render(
      <SearchFilters
        filters={filtersWithValues}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
      />
    );

    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 12,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      );
    });
  });

  it('renders with custom className', () => {
    const { container } = render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={mockPopularLocations}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles empty popular locations', () => {
    render(
      <SearchFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        popularLocations={[]}
      />
    );

    // Expand filters first
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    const locationButton = screen.getByText('Any location');
    expect(locationButton).toBeInTheDocument();
  });
});
